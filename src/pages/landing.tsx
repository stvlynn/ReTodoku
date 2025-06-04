import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import { getAvatarUrl } from "@/lib/database";
import { format } from "date-fns";
import tapOnPostcardImage from "@/assets/tap-on-postcard.png";

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

export default function Landing() {
  const { templates, isLoading, error, getActivatedPostcards } = useDatabase();

  // Get latest 4 postcard templates for the request section
  const latestPostcards = templates.slice(0, 4);

  // Get recent activated postcards for display
  const recentActivatedPostcards = getActivatedPostcards().slice(0, 3);

  if (isLoading) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen">
      {/* Hero Section */}
      <div className="w-full px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Let every memory <span className="text-blue-600">todoku</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Share your moments through beautiful NFC postcards. Scan, activate, and collect memories from friends around the world.
          </p>
          <Link to="/request">
            <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              <i className="ri-send-plane-line mr-2"></i>
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Image - 缩小尺寸 */}
      <div className="w-full px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={tapOnPostcardImage} 
              alt="Tap on postcard to send" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activated Postcards */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center">
              <i className="ri-gift-line mr-2 text-gray-600"></i>
              Recent Activations
            </h3>
            <div className="space-y-4">
              {recentActivatedPostcards.length > 0 ? (
                recentActivatedPostcards.map((postcard) => (
                  <div key={postcard.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={getAvatarUrl(postcard.recipient?.platform || 'other', postcard.recipient?.handle || '')} 
                          alt={postcard.recipient?.name} 
                        />
                        <AvatarFallback>{postcard.recipient?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm flex items-center">
                          <i className="ri-user-line mr-1 text-xs text-gray-500"></i>
                          {postcard.recipient?.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/u/${postcard.recipient?.slug}`}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                          >
                            <i className={`${getPlatformIcon(postcard.recipient?.platform || 'other')} mr-1`}></i>
                            {postcard.recipient?.platform === "email" ? postcard.recipient?.handle : `@${postcard.recipient?.handle}`}
                          </Link>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{getPlatformName(postcard.recipient?.platform || 'other')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 flex items-center">
                        <i className="ri-gift-line mr-1"></i>
                        {format(new Date(postcard.activated_at!), 'MMMM d, yyyy')}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-green-600 flex items-center">
                          <i className="ri-checkbox-circle-line mr-1"></i>
                          Activated
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <i className="ri-gift-line text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500 text-sm">No recent activations</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <i className="ri-information-line mr-1"></i>
                Click on usernames to view their postcard collections
              </p>
            </div>
          </Card>

          {/* Request a Postcard */}
          <Link to="/request" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-lg mb-6 flex items-center">
                <i className="ri-mail-add-line mr-2 text-gray-600"></i>
                Request a Postcard
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {latestPostcards.map((template) => (
                  <div key={template.id} className="aspect-square rounded-lg overflow-hidden relative group">
                    <img
                      src={template.image_url}
                      alt={template.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <i className="ri-eye-line text-white text-lg"></i>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center flex items-center justify-center">
                <i className="ri-arrow-right-line mr-1"></i>
                Choose from our latest collection
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}