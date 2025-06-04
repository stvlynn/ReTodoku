import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDatabase } from "@/hooks/useDatabase";
import { getAvatarUrl } from "@/lib/database";
import { format } from "date-fns";
import type { User, NFCPostcard } from "@/lib/database";

export default function UserPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getUserBySlug, getNFCPostcardsByRecipient, isLoading: globalLoading, error: globalError } = useDatabase();
  
  const [user, setUser] = useState<User | null>(null);
  const [postcards, setPostcards] = useState<NFCPostcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!slug) {
        setError('Invalid slug');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user by slug
        const userData = await getUserBySlug(slug);
        if (!userData) {
          setError('User not found');
          return;
        }
        
        setUser(userData);
        
        // Get postcards received by this user
        const postcardsData = await getNFCPostcardsByRecipient(userData.id);
        setPostcards(postcardsData);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [slug]);

  // Helper function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "ri-twitter-x-line";
      case "email":
        return "ri-mail-line";
      case "telegram":
        return "ri-telegram-line";
      default:
        return "ri-global-line";
    }
  };

  // Helper function to get platform URL
  const getPlatformUrl = (platform: string, handle: string) => {
    switch (platform) {
      case "twitter":
        return `https://x.com/${handle}`;
      case "email":
        return `mailto:${handle}`;
      case "telegram":
        return `https://t.me/${handle}`;
      default:
        return "#";
    }
  };

  // Helper function to get platform name
  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "Twitter/X";
      case "email":
        return "Email";
      case "telegram":
        return "Telegram";
      default:
        return "Other";
    }
  };

  if (loading || globalLoading) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || globalError) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
          <p className="text-red-600">Error: {error || globalError}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-user-unfollow-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen">
      {/* Header Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4">
              <AvatarImage 
                src={getAvatarUrl(user.platform, user.handle)} 
                alt={user.name} 
              />
              <AvatarFallback className="text-lg sm:text-xl lg:text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              {user.name}'s Postcard Collection
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-600">
              <a
                href={getPlatformUrl(user.platform, user.handle)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <i className={getPlatformIcon(user.platform)}></i>
                <span className="text-sm sm:text-base">
                  {user.platform === "email" ? user.handle : `@${user.handle}`}
                </span>
              </a>
              <span className="text-gray-400 hidden sm:inline">·</span>
              <span className="text-sm sm:text-base">{getPlatformName(user.platform)}</span>
            </div>
          </div>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Memories collected through NFC technology
          </p>
        </div>
      </div>

      {/* Postcards Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto">
          {postcards.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center mx-4">
              <i className="ri-mail-line text-4xl sm:text-5xl lg:text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">
                No Postcards Yet
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                {user.name} hasn't confirmed delivery of any postcards yet. Waiting for the first beautiful memory to arrive...
              </p>
            </Card>
          ) : (
            <>
              <div className="text-center mb-6 sm:mb-8 px-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Postcard Collection
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {postcards.length} confirmed deliveries · Sorted by delivery confirmation time
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4">
                {postcards.map((postcard) => {
                  // Get image URL (custom or template)
                  const imageUrl = postcard.custom_image_url || postcard.template?.image_url;
                  
                  return (
                    <Card key={postcard.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                      {/* Postcard Image */}
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={postcard.template?.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </div>
                        {postcard.template?.name && (
                          <div className="absolute bottom-3 left-3 right-3">
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white truncate block">
                              {postcard.template.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Postcard Content */}
                      <div className="p-4 sm:p-6">
                        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 truncate">
                          {postcard.template?.name || 'Custom Postcard'}
                        </h3>
                        
                        {postcard.message && (
                          <blockquote className="text-gray-700 mb-4 italic text-sm line-clamp-3">
                            "{postcard.message}"
                          </blockquote>
                        )}
                        
                        {/* Sender Info */}
                        {postcard.sender ? (
                          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage 
                                src={getAvatarUrl(postcard.sender.platform, postcard.sender.handle)} 
                                alt={postcard.sender.name} 
                              />
                              <AvatarFallback className="text-xs">
                                {postcard.sender.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm text-gray-900 truncate">From: {postcard.sender.name}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <i className={getPlatformIcon(postcard.sender.platform)}></i>
                                <span className="truncate">
                                  {postcard.sender.platform === "email" 
                                    ? postcard.sender.handle 
                                    : `@${postcard.sender.handle}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                            <i className="ri-ghost-line text-gray-400"></i>
                            <span className="text-sm text-gray-600">Anonymous sender</span>
                          </div>
                        )}
                        
                        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <i className="ri-gift-line flex-shrink-0"></i>
                            <span className="truncate">Delivered {format(new Date(postcard.activated_at!), 'MMM d, yyyy')}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <i className="ri-calendar-line flex-shrink-0"></i>
                            <span className="truncate">Created {format(new Date(postcard.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Precious memories collected through NFC technology ·{" "}
            <span className="text-blue-600 font-medium">ReTodoku</span>
          </p>
        </div>
      </div>
    </div>
  );
} 