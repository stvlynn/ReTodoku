-- Migration: Add twitter_id column to users table
-- Date: 2025-06-10
-- Description: Add twitter_id column to store Twitter digital ID for OAuth integration

-- Add twitter_id column to users table
ALTER TABLE users ADD COLUMN twitter_id TEXT;

-- Create index on twitter_id for faster lookups
CREATE INDEX idx_users_twitter_id ON users(twitter_id);

-- Add unique constraint to ensure each Twitter ID can only be associated with one user
CREATE UNIQUE INDEX idx_users_twitter_id_unique ON users(twitter_id) WHERE twitter_id IS NOT NULL;