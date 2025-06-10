import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { User } from '@/lib/database';

interface TwitterAuthProps {
  onAuthSuccess: (user: User) => void;
  onAuthError: (error: string) => void;
}


export function TwitterAuth({ onAuthSuccess, onAuthError }: TwitterAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateTwitterLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get request token from our API
      const response = await fetch('/api/auth/twitter/request-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get request token');
      }

      const { authUrl } = await response.json();
      
      // Step 2: Redirect to Twitter OAuth
      window.location.href = authUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Twitter authentication failed';
      setError(errorMessage);
      onAuthError(errorMessage);
      setIsLoading(false);
    }
  };

  // This function will be called when user returns from Twitter OAuth
  const handleTwitterCallback = async (oauthToken: string, oauthVerifier: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 3: Exchange tokens for access token and user data
      const response = await fetch('/api/auth/twitter/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oauth_token: oauthToken,
          oauth_verifier: oauthVerifier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete Twitter authentication');
      }

      const { user } = await response.json();
      onAuthSuccess(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Twitter authentication failed';
      setError(errorMessage);
      onAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we're returning from Twitter OAuth
  const urlParams = new URLSearchParams(window.location.search);
  const oauthToken = urlParams.get('oauth_token');
  const oauthVerifier = urlParams.get('oauth_verifier');

  // If we have OAuth parameters, handle the callback
  if (oauthToken && oauthVerifier && !isLoading) {
    handleTwitterCallback(oauthToken, oauthVerifier);
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={initiateTwitterLogin}
        disabled={isLoading}
        className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4" />
            Connecting to Twitter...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Continue with Twitter
          </>
        )}
      </Button>
    </div>
  );
}