import { useState, useEffect } from 'react';
import { User } from '@/lib/database';

interface TwitterAuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface TwitterAuthActions {
  login: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export function useTwitterAuth(): TwitterAuthState & TwitterAuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated (e.g., from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('twitter_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('twitter_user');
      }
    }
  }, []);

  // Handle Twitter OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthToken = urlParams.get('oauth_token');
      const oauthVerifier = urlParams.get('oauth_verifier');
      const requestTokenSecret = localStorage.getItem('twitter_request_token_secret');

      if (oauthToken && oauthVerifier && requestTokenSecret) {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch('/api/auth/twitter/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              oauth_token: oauthToken,
              oauth_verifier: oauthVerifier,
              oauth_token_secret: requestTokenSecret,
            }),
          });

          if (!response.ok) {
            throw new Error('Twitter authentication failed');
          }

          const { user: authenticatedUser } = await response.json();
          setUser(authenticatedUser);
          localStorage.setItem('twitter_user', JSON.stringify(authenticatedUser));
          localStorage.removeItem('twitter_request_token_secret');

          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
          setError(errorMessage);
          localStorage.removeItem('twitter_request_token_secret');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleCallback();
  }, []);

  const login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/twitter/request-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Twitter login');
      }

      const { authUrl, requestTokenSecret } = await response.json();
      
      // Store request token secret for callback
      localStorage.setItem('twitter_request_token_secret', requestTokenSecret);
      
      // Redirect to Twitter
      window.location.href = authUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('twitter_user');
    localStorage.removeItem('twitter_request_token_secret');
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    clearError,
  };
}