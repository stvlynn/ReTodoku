// Database hook for React components
// Provides easy access to database operations via API calls

import { useState, useEffect } from 'react';
import { User, PostcardTemplate, NFCPostcard } from '@/lib/database';

// API service class for making HTTP requests to the backend
class APIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://retodoku.stvlynn.workers.dev/api';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserBySlug(slug: string): Promise<User | null> {
    try {
      return await this.request<User>(`/users/slug/${slug}`);
    } catch (error) {
      // Return null if user not found
      return null;
    }
  }

  async getPostcardTemplates(): Promise<PostcardTemplate[]> {
    return this.request<PostcardTemplate[]>('/templates');
  }

  async getNFCPostcards(): Promise<NFCPostcard[]> {
    return this.request<NFCPostcard[]>('/nfc-postcards');
  }

  async getNFCPostcardByHash(hash: string): Promise<NFCPostcard | null> {
    try {
      return await this.request<NFCPostcard>(`/nfc-postcards/${hash}`);
    } catch (error) {
      return null;
    }
  }

  async getNFCPostcardsByRecipient(recipientId: number): Promise<NFCPostcard[]> {
    return this.request<NFCPostcard[]>(`/nfc-postcards/recipient/${recipientId}`);
  }

  async activateNFCPostcard(hash: string, recipientId: number): Promise<void> {
    await this.request(`/nfc-postcards/${hash}/activate`, {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'slug'>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createNFCPostcard(postcardData: Omit<NFCPostcard, 'id' | 'created_at' | 'updated_at' | 'sender' | 'recipient' | 'template' | 'postcard_hash'>): Promise<NFCPostcard> {
    return this.request<NFCPostcard>('/nfc-postcards', {
      method: 'POST',
      body: JSON.stringify(postcardData),
    });
  }
}

// Main database hook
export function useDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<PostcardTemplate[]>([]);
  const [nfcPostcards, setNfcPostcards] = useState<NFCPostcard[]>([]);

  const apiService = new APIService();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [usersData, templatesData, postcardsData] = await Promise.all([
          apiService.getUsers(),
          apiService.getPostcardTemplates(),
          apiService.getNFCPostcards()
        ]);
        
        setUsers(usersData);
        setTemplates(templatesData);
        setNfcPostcards(postcardsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Utility functions
  const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'slug'>) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  };

  const getUserBySlug = async (slug: string) => {
    try {
      return await apiService.getUserBySlug(slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user');
      throw err;
    }
  };

  const getNFCPostcardByHash = async (hash: string) => {
    try {
      return await apiService.getNFCPostcardByHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get postcard');
      throw err;
    }
  };

  const getNFCPostcardsByRecipient = async (recipientId: number) => {
    try {
      return await apiService.getNFCPostcardsByRecipient(recipientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user postcards');
      throw err;
    }
  };

  const activateNFCPostcard = async (hash: string, recipientId: number) => {
    try {
      await apiService.activateNFCPostcard(hash, recipientId);
      
      // Update local state
      setNfcPostcards(prev => prev.map(postcard => 
        postcard.postcard_hash === hash 
          ? { 
              ...postcard, 
              recipient_id: recipientId, 
              is_activated: true, 
              activated_at: new Date().toISOString() 
            }
          : postcard
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate postcard');
      throw err;
    }
  };

  const createNFCPostcard = async (postcardData: Omit<NFCPostcard, 'id' | 'created_at' | 'updated_at' | 'sender' | 'recipient' | 'template' | 'postcard_hash'>) => {
    try {
      const newPostcard = await apiService.createNFCPostcard(postcardData);
      setNfcPostcards(prev => [newPostcard, ...prev]);
      return newPostcard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create postcard');
      throw err;
    }
  };

  // Helper functions
  const getActivatedPostcards = () => {
    return nfcPostcards.filter(p => p.is_activated).sort((a, b) => 
      new Date(b.activated_at || '').getTime() - new Date(a.activated_at || '').getTime()
    );
  };

  const getUnactivatedPostcards = () => {
    return nfcPostcards.filter(p => !p.is_activated);
  };

  return {
    // State
    isLoading,
    error,
    users,
    templates,
    nfcPostcards,
    
    // Actions
    createUser,
    getUserBySlug,
    getNFCPostcardByHash,
    getNFCPostcardsByRecipient,
    activateNFCPostcard,
    createNFCPostcard,
    
    // Helpers
    getActivatedPostcards,
    getUnactivatedPostcards,
    
    // Clear error
    clearError: () => setError(null)
  };
} 