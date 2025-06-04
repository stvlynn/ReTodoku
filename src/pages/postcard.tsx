import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDatabase } from "@/hooks/useDatabase";
import { getAvatarUrl } from "@/lib/database";
import { format } from "date-fns";
import type { NFCPostcard } from "@/lib/database";

export default function PostcardPage() {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const { getNFCPostcardByHash, activateNFCPostcard, users, isLoading: globalLoading, error: globalError } = useDatabase();
  
  const [postcard, setPostcard] = useState<NFCPostcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadPostcard = async () => {
      if (!hash) {
        setError('Invalid postcard hash');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const postcardData = await getNFCPostcardByHash(hash);
        if (!postcardData) {
          setError('Postcard not found');
          return;
        }
        
        setPostcard(postcardData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load postcard');
      } finally {
        setLoading(false);
      }
    };

    loadPostcard();
  }, [hash]);

  const handleActivate = async () => {
    if (!postcard || !selectedUserId || activating) return;

    try {
      setActivating(true);
      setError(null);
      
      await activateNFCPostcard(postcard.postcard_hash, selectedUserId);
      
      // 直接更新当前状态，而不是重新查询
      const selectedUser = users.find(u => u.id === selectedUserId);
      setPostcard(prev => prev ? {
        ...prev,
        recipient_id: selectedUserId,
        recipient: selectedUser,
        is_activated: true,
        activated_at: new Date().toISOString()
      } : null);
      
      // 延迟导航，让用户看到激活成功的状态
      setTimeout(() => {
        if (selectedUser) {
          navigate(`/u/${selectedUser.slug}`);
        }
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate postcard');
    } finally {
      setActivating(false);
    }
  };

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

  if (loading || globalLoading) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-4"></i>
          <p className="text-gray-600">Loading postcard...</p>
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
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4"
            variant="outline"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!postcard) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-mail-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">Postcard not found</p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4"
            variant="outline"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Get image URL (custom or template)
  const imageUrl = postcard.custom_image_url || postcard.template?.image_url;

  return (
    <div className="w-full bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {postcard.is_activated ? 'Postcard Delivered' : 'Postcard Found!'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            {postcard.is_activated 
              ? 'This postcard has been delivered and added to the collection' 
              : 'You discovered this beautiful postcard by scanning the NFC tag'}
          </p>
        </div>
      </div>

      {/* Postcard Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="overflow-hidden shadow-xl">
            {/* Postcard Image */}
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={imageUrl}
                alt={postcard.template?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  postcard.is_activated 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {postcard.is_activated ? 'Delivered' : 'Pending'}
                </span>
              </div>
              {postcard.template?.name && (
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-black/70 text-white">
                    {postcard.template.name}
                  </span>
                </div>
              )}
            </div>
            
            {/* Postcard Details */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Message */}
              {postcard.message && (
                <blockquote className="text-base sm:text-lg text-gray-800 mb-4 sm:mb-6 italic text-center border-l-4 border-blue-500 pl-4">
                  "{postcard.message}"
                </blockquote>
              )}
              
              {/* Sender Info */}
              {postcard.sender && (
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    <AvatarImage 
                      src={getAvatarUrl(postcard.sender.platform, postcard.sender.handle)} 
                      alt={postcard.sender.name} 
                    />
                    <AvatarFallback className="text-sm sm:text-base">
                      {postcard.sender.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">From: {postcard.sender.name}</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <i className={getPlatformIcon(postcard.sender.platform)}></i>
                      <span className="truncate">
                        {postcard.sender.platform === "email" 
                          ? postcard.sender.handle 
                          : `@${postcard.sender.handle}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Creation Date */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                <i className="ri-calendar-line flex-shrink-0"></i>
                <span>Created {format(new Date(postcard.created_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
              
              {/* Delivery Section */}
              {postcard.is_activated ? (
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <i className="ri-checkbox-circle-line"></i>
                    <span className="font-medium text-sm sm:text-base">Postcard Delivered</span>
                  </div>
                  {postcard.recipient && (
                    <p className="text-xs sm:text-sm text-green-700">
                      Added to {postcard.recipient.name}'s collection
                    </p>
                  )}
                  {postcard.activated_at && (
                    <p className="text-xs sm:text-sm text-green-600 mt-1">
                      Delivered: {format(new Date(postcard.activated_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  )}
                  {postcard.recipient && (
                    <Button 
                      onClick={() => navigate(`/u/${postcard.recipient?.slug}`)}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                      disabled={activating}
                    >
                      {activating ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <i className="ri-user-line mr-2"></i>
                          View Collection
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 mb-3 sm:mb-4">
                    <i className="ri-gift-line"></i>
                    <span className="font-medium text-sm sm:text-base">Confirm Delivery</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 mb-3 sm:mb-4">
                    Select your account to confirm delivery of this postcard. It will be added to your personal collection.
                  </p>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <i className="ri-error-warning-line flex-shrink-0"></i>
                        <span className="text-xs sm:text-sm">{error}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* User Selection */}
                  <div className="space-y-2 mb-3 sm:mb-4">
                    {users.map((user) => (
                      <label 
                        key={user.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUserId === user.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${activating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name="user"
                          value={user.id}
                          checked={selectedUserId === user.id}
                          onChange={() => !activating && setSelectedUserId(user.id)}
                          disabled={activating}
                          className="sr-only"
                        />
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                          <AvatarImage 
                            src={getAvatarUrl(user.platform, user.handle)} 
                            alt={user.name} 
                          />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <i className={getPlatformIcon(user.platform)}></i>
                            <span className="truncate">
                              {user.platform === "email" ? user.handle : `@${user.handle}`}
                            </span>
                          </div>
                        </div>
                        {selectedUserId === user.id && (
                          <i className="ri-check-line text-blue-600 ml-auto flex-shrink-0"></i>
                        )}
                      </label>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleActivate}
                    disabled={!selectedUserId || activating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {activating ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Confirming Delivery...
                      </>
                    ) : (
                      <>
                        <i className="ri-gift-line mr-2"></i>
                        Confirm Delivery
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Precious memories shared through NFC technology ·{" "}
            <span className="text-blue-600 font-medium">ReTodoku</span>
          </p>
        </div>
      </div>
    </div>
  );
} 