# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

## Architecture Overview

ReTodoku is a React TypeScript application for an NFC postcard collection system, deployed on Cloudflare Pages with D1 database backend.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI components
- **Routing**: React Router v6 with lazy loading
- **Database**: Cloudflare D1 (SQLite)
- **Backend**: Cloudflare Workers
- **Deployment**: Cloudflare Pages

### Project Structure
- **Frontend**: React SPA with component-based architecture
- **Database Layer**: Service classes with TypeScript interfaces
- **API Layer**: Cloudflare Worker with RESTful endpoints
- **Routing**: File-based page structure with lazy loading

### Key Components
- **Database Service** (`src/lib/database.ts`): Main data access layer with CRUD operations for users, postcard templates, and NFC postcards
- **Worker API** (`src/api/worker.ts`): Cloudflare Worker serving REST API endpoints
- **Database Hook** (`src/hooks/useDatabase.ts`): React hook for database operations
- **Router** (`src/router.tsx`): Centralized routing with lazy-loaded pages

### Database Schema
Four core entities:
- `users` - Multi-platform user accounts (Twitter, Telegram, Email) with Twitter OAuth support
- `postcard_templates` - Reusable postcard designs
- `nfc_postcards` - Individual postcard instances with activation tracking
- `meetup_photos` - Photos associated with postcard meetups

### Twitter OAuth Integration
- **Authentication Flow**: OAuth 1.0a with request token → authorization → access token
- **User Data**: Stores Twitter digital ID (`twitter_id`) for unique identification
- **Components**: `TwitterAuth` component and `useTwitterAuth` hook
- **API Endpoints**: `/api/auth/twitter/request-token` and `/api/auth/twitter/callback`

### Development vs Production
- **Development**: Uses mock data service for local development
- **Production**: Connects to Cloudflare D1 database via Workers

### Path Aliases
- `@/` maps to `src/` directory

### Database Migrations
- Located in `migrations/` directory
- Apply with: `wrangler d1 migrations apply retodoku-prod-db`

## Cloudflare Configuration

The application is configured for Cloudflare Pages deployment:
- Build output directory: `dist`
- Wrangler config in `wrangler.toml`
- Environment variables managed through Cloudflare dashboard

### Required Environment Variables
- `TWITTER_CONSUMER_KEY` - Twitter API consumer key
- `TWITTER_CONSUMER_SECRET` - Twitter API consumer secret
- `FRONTEND_URL` - Application frontend URL
- `TWITTER_CALLBACK_URL` - OAuth callback URL (optional, defaults to frontend + `/auth/twitter/callback`)