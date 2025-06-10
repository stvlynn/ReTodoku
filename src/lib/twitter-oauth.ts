// Twitter OAuth utility functions for Cloudflare Workers
import { OAuth } from 'oauth';

export interface TwitterOAuthConfig {
  consumerKey: string;
  consumerSecret: string;
  callbackUrl: string;
}

export interface TwitterUserData {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export class TwitterOAuthService {
  private oauth: OAuth;
  private consumerKey: string;
  private consumerSecret: string;
  private callbackUrl: string;

  constructor(config: TwitterOAuthConfig) {
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.callbackUrl = config.callbackUrl;

    this.oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      this.consumerKey,
      this.consumerSecret,
      '1.0A',
      this.callbackUrl,
      'HMAC-SHA1'
    );
  }

  // Step 1: Get request token and authorization URL
  async getRequestToken(): Promise<{ token: string; tokenSecret: string; authUrl: string }> {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
        if (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          reject(new Error(`Failed to get request token: ${errorMessage}`));
          return;
        }

        const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
        
        resolve({
          token: oauthToken,
          tokenSecret: oauthTokenSecret,
          authUrl,
        });
      });
    });
  }

  // Step 2: Exchange request token for access token
  async getAccessToken(
    oauthToken: string,
    oauthTokenSecret: string,
    oauthVerifier: string
  ): Promise<{ accessToken: string; accessTokenSecret: string }> {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(
        oauthToken,
        oauthTokenSecret,
        oauthVerifier,
        (error, oauthAccessToken, oauthAccessTokenSecret) => {
          if (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            reject(new Error(`Failed to get access token: ${errorMessage}`));
            return;
          }

          resolve({
            accessToken: oauthAccessToken,
            accessTokenSecret: oauthAccessTokenSecret,
          });
        }
      );
    });
  }

  // Step 3: Get user data using access token
  async getUserData(accessToken: string, accessTokenSecret: string): Promise<TwitterUserData> {
    return new Promise((resolve, reject) => {
      this.oauth.get(
        'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            reject(new Error(`Failed to get user data: ${errorMessage}`));
            return;
          }

          try {
            const userData = JSON.parse(data as string);
            resolve({
              id: userData.id_str,
              username: userData.screen_name,
              name: userData.name,
              profile_image_url: userData.profile_image_url_https,
            });
          } catch {
            reject(new Error('Failed to parse user data'));
          }
        }
      );
    });
  }

  // Complete OAuth flow: from request token to user data
  async completeOAuthFlow(
    oauthToken: string,
    oauthTokenSecret: string,
    oauthVerifier: string
  ): Promise<TwitterUserData> {
    const { accessToken, accessTokenSecret } = await this.getAccessToken(
      oauthToken,
      oauthTokenSecret,
      oauthVerifier
    );

    return this.getUserData(accessToken, accessTokenSecret);
  }
}

// Utility function to create Twitter OAuth service instance
export function createTwitterOAuthService(env: { 
  TWITTER_CONSUMER_KEY: string; 
  TWITTER_CONSUMER_SECRET: string; 
  TWITTER_CALLBACK_URL?: string; 
  FRONTEND_URL: string; 
}): TwitterOAuthService {
  const config: TwitterOAuthConfig = {
    consumerKey: env.TWITTER_CONSUMER_KEY,
    consumerSecret: env.TWITTER_CONSUMER_SECRET,
    callbackUrl: env.TWITTER_CALLBACK_URL || `${env.FRONTEND_URL}/auth/twitter/callback`,
  };

  return new TwitterOAuthService(config);
}