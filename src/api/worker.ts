// Cloudflare Worker API for ReTodoku NFC Postcard System
// This file implements the backend API for the NFC postcard collection system

import { DatabaseService } from '../lib/database';
import { createTwitterOAuthService } from '../lib/twitter-oauth';

export interface Env {
  DB: D1Database;
  TWITTER_CONSUMER_KEY: string;
  TWITTER_CONSUMER_SECRET: string;
  TWITTER_CALLBACK_URL?: string;
  FRONTEND_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Initialize database service
    const dbService = new DatabaseService(env.DB);

    // CORS headers - 优化配置以支持所有必要的头信息
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // 24小时预检缓存
      'Access-Control-Allow-Credentials': 'false',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Routes
      switch (true) {
        // Get all users
        case path === '/api/users' && method === 'GET':
          const users = await dbService.getUsers();
          return Response.json(users, { headers: corsHeaders });

        // Create a new user
        case path === '/api/users' && method === 'POST':
          const userData = await request.json();
          const newUser = await dbService.createUser(userData);
          return Response.json(newUser, { status: 201, headers: corsHeaders });

        // Get user by slug
        case path.startsWith('/api/users/slug/') && method === 'GET':
          const slug = path.split('/').pop();
          if (!slug) {
            return new Response('Invalid slug', { status: 400, headers: corsHeaders });
          }
          const user = await dbService.getUserBySlug(slug);
          if (!user) {
            return new Response('User not found', { status: 404, headers: corsHeaders });
          }
          return Response.json(user, { headers: corsHeaders });

        // Get all postcard templates
        case path === '/api/templates' && method === 'GET':
          const templates = await dbService.getPostcardTemplates();
          return Response.json(templates, { headers: corsHeaders });

        // Get all NFC postcards
        case path === '/api/nfc-postcards' && method === 'GET':
          const nfcPostcards = await dbService.getNFCPostcards();
          return Response.json(nfcPostcards, { headers: corsHeaders });

        // Create a new NFC postcard
        case path === '/api/nfc-postcards' && method === 'POST':
          const postcardData = await request.json();
          const newPostcard = await dbService.createNFCPostcard(postcardData);
          return Response.json(newPostcard, { status: 201, headers: corsHeaders });

        // Get NFC postcard by hash
        case path.startsWith('/api/nfc-postcards/') && !path.includes('/activate') && !path.includes('/recipient/') && method === 'GET':
          const hash = path.split('/').pop();
          if (!hash) {
            return new Response('Invalid hash', { status: 400, headers: corsHeaders });
          }
          const postcard = await dbService.getNFCPostcardByHash(hash);
          if (!postcard) {
            return new Response('Postcard not found', { status: 404, headers: corsHeaders });
          }
          return Response.json(postcard, { headers: corsHeaders });

        // Activate NFC postcard
        case path.match(/^\/api\/nfc-postcards\/[^/]+\/activate$/) && method === 'POST':
          const activateHash = path.split('/')[3];
          const activateData = await request.json();
          if (!activateHash || !activateData.recipientId) {
            return new Response('Invalid hash or recipient ID', { status: 400, headers: corsHeaders });
          }
          await dbService.activateNFCPostcard(activateHash, activateData.recipientId);
          return Response.json({ success: true }, { headers: corsHeaders });

        // Get NFC postcards by recipient
        case path.startsWith('/api/nfc-postcards/recipient/') && method === 'GET':
          const recipientId = parseInt(path.split('/').pop() || '0');
          if (!recipientId) {
            return new Response('Invalid recipient ID', { status: 400, headers: corsHeaders });
          }
          const recipientPostcards = await dbService.getNFCPostcardsByRecipient(recipientId);
          return Response.json(recipientPostcards, { headers: corsHeaders });

        // Get meetup photos by postcard ID
        case path.startsWith('/api/meetup-photos/postcard/') && method === 'GET':
          const postcardId = parseInt(path.split('/').pop() || '0');
          if (!postcardId) {
            return new Response('Invalid postcard ID', { status: 400, headers: corsHeaders });
          }
          const photos = await dbService.getMeetupPhotosByPostcardId(postcardId);
          return Response.json(photos, { headers: corsHeaders });

        // Create meetup photo
        case path === '/api/meetup-photos' && method === 'POST':
          const photoData = await request.json();
          const newPhoto = await dbService.createMeetupPhoto(photoData);
          return Response.json(newPhoto, { status: 201, headers: corsHeaders });

        // Twitter OAuth: Get request token
        case path === '/api/auth/twitter/request-token' && method === 'POST': {
          const twitterOAuth = createTwitterOAuthService(env);
          const { token, tokenSecret, authUrl } = await twitterOAuth.getRequestToken();
          
          // Store token secret temporarily (in production, use KV or session storage)
          // For now, we'll include it in the response and handle it client-side
          return Response.json({ 
            authUrl,
            requestToken: token,
            requestTokenSecret: tokenSecret
          }, { headers: corsHeaders });
        }

        // Twitter OAuth: Handle callback
        case path === '/api/auth/twitter/callback' && method === 'POST': {
          const callbackData = await request.json();
          const { oauth_token, oauth_verifier, oauth_token_secret } = callbackData;
          
          if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
            return Response.json(
              { error: 'Missing OAuth parameters' },
              { status: 400, headers: corsHeaders }
            );
          }

          const twitterService = createTwitterOAuthService(env);
          const twitterUserData = await twitterService.completeOAuthFlow(
            oauth_token,
            oauth_token_secret,
            oauth_verifier
          );

          // Check if user already exists
          let twitterUser = await dbService.getUserByTwitterId(twitterUserData.id);
          
          if (!twitterUser) {
            // Create new user from Twitter data
            twitterUser = await dbService.createUserFromTwitter(twitterUserData);
          }

          return Response.json({ user: twitterUser }, { headers: corsHeaders });
        }

        // Get user by Twitter ID
        case path.startsWith('/api/users/twitter/') && method === 'GET': {
          const twitterId = path.split('/').pop();
          if (!twitterId) {
            return new Response('Invalid Twitter ID', { status: 400, headers: corsHeaders });
          }
          const twitterUser = await dbService.getUserByTwitterId(twitterId);
          if (!twitterUser) {
            return new Response('User not found', { status: 404, headers: corsHeaders });
          }
          return Response.json(twitterUser, { headers: corsHeaders });
        }

        // Health check
        case path === '/api/health' && method === 'GET':
          return Response.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            database: 'connected',
            version: '2.0.0',
            system: 'NFC Postcard Collection'
          }, { headers: corsHeaders });

        default:
          return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('API Error:', error);
      return Response.json(
        { 
          error: 'Internal Server Error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        },
        { status: 500, headers: corsHeaders }
      );
    }
  },
} satisfies ExportedHandler<Env>; 