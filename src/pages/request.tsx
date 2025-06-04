import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from "@/hooks/useDatabase";

export default function RequestPage() {
  const { templates, isLoading, error } = useDatabase();
  const [selectedPostcard, setSelectedPostcard] = useState<string>("");
  const [receiptMethod, setReceiptMethod] = useState<string>("shipping");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    platform: "twitter",
    address: "",
    meetupDate: "",
    meetupLocation: ""
  });
  const { toast } = useToast();

  // Set default selected postcard when templates load
  useEffect(() => {
    if (templates.length > 0 && !selectedPostcard) {
      setSelectedPostcard(templates[0].id.toString());
    }
  }, [templates, selectedPostcard]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Request submitted",
      description: "Your postcard request has been submitted successfully!",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-4"></i>
          <p className="text-gray-600">Loading postcard templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
          <p className="text-red-600">Error loading templates: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
      {/* LEFT: postcard selector */}
      <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Postcard Design</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedPostcard(template.id.toString())}
                >
                  <div className="aspect-[3/2] rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-200">
              <img 
                      src={template.image_url} 
                      alt={template.name} 
                      className="object-cover w-full h-full"
              />
                  </div>
                  
                  {/* Template name */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                    <p className="text-white text-sm font-medium">{template.name}</p>
                    {template.description && (
                      <p className="text-white/80 text-xs">{template.description}</p>
                    )}
                  </div>
                  
                  {/* Selection indicator */}
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    {selectedPostcard === template.id.toString() ? (
                      <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Selected border */}
                  {selectedPostcard === template.id.toString() && (
                    <div className="absolute inset-0 border-3 border-gray-900 rounded-xl pointer-events-none"></div>
                  )}
                </div>
          ))}
        </div>
      </div>

      {/* RIGHT: form */}
          <Card className="p-8 h-fit">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <h1 className="text-2xl font-bold text-gray-900">
                <i className="ri-mail-send-line mr-2"></i>
                Request a Postcard
              </h1>

          <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                  <i className="ri-user-line mr-2"></i>
                  Your Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Alex" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12"
                  required 
                />
          </div>

          <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center">
                  <i className="ri-at-line mr-2"></i>
                  Preferred ID
                </Label>
                <Input 
                  id="username" 
                  placeholder="@username" 
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="h-12"
                  required 
                />
          </div>

          <div className="space-y-2">
                <Label htmlFor="platform" className="text-sm font-medium text-gray-700 flex items-center">
                  <i className="ri-global-line mr-2"></i>
                  Platform
                </Label>
                <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                  <SelectTrigger className="h-12">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="twitter">
                      <div className="flex items-center">
                        <i className="ri-twitter-x-line mr-2"></i>
                        Twitter/X
                      </div>
                    </SelectItem>
                    <SelectItem value="telegram">
                      <div className="flex items-center">
                        <i className="ri-telegram-line mr-2"></i>
                        Telegram
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center">
                        <i className="ri-mail-line mr-2"></i>
                        Email
                      </div>
                    </SelectItem>
              </SelectContent>
            </Select>
          </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <i className="ri-truck-line mr-2"></i>
                  How would you like to receive it?
                </Label>

          <div className="space-y-3">
                  <div 
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      receiptMethod === "shipping" 
                        ? "border-gray-900 bg-gray-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setReceiptMethod("shipping")}
                  >
                    <div className="w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center">
                      {receiptMethod === "shipping" && (
                        <i className="ri-check-line text-gray-900 text-sm"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <i className="ri-truck-line mr-2 text-gray-600"></i>
                        <span className="font-medium">Ship to my address</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">We'll mail the postcard to you</p>
                    </div>
                  </div>

                  <div 
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      receiptMethod === "meetup" 
                        ? "border-gray-900 bg-gray-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setReceiptMethod("meetup")}
                  >
                    <div className="w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center">
                      {receiptMethod === "meetup" && (
                        <i className="ri-check-line text-gray-900 text-sm"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <i className="ri-map-pin-line mr-2 text-gray-600"></i>
                        <span className="font-medium">Meetup pickup</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">We'll arrange a meetup to give it to you</p>
                    </div>
                  </div>
              </div>
          </div>

          {receiptMethod === "shipping" && (
            <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center">
                    <i className="ri-map-pin-line mr-2"></i>
                    Shipping Address
                  </Label>
              <Textarea 
                id="address" 
                    placeholder="Enter your full address..." 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="min-h-[100px]"
                required
              />
            </div>
          )}

              {receiptMethod === "meetup" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meetupDate" className="text-sm font-medium text-gray-700 flex items-center">
                      <i className="ri-calendar-line mr-2"></i>
                      Preferred Date
                    </Label>
                    <Input 
                      id="meetupDate" 
                      type="date"
                      value={formData.meetupDate}
                      onChange={(e) => handleInputChange('meetupDate', e.target.value)}
                      className="h-12"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetupLocation" className="text-sm font-medium text-gray-700 flex items-center">
                      <i className="ri-map-pin-line mr-2"></i>
                      Preferred Location
                    </Label>
                    <Input 
                      id="meetupLocation" 
                      placeholder="e.g. Central Park, NYC"
                      value={formData.meetupLocation}
                      onChange={(e) => handleInputChange('meetupLocation', e.target.value)}
                      className="h-12"
                      required 
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-lg bg-gray-900 hover:bg-gray-800">
                <i className="ri-send-plane-line mr-2"></i>
                Submit Request
          </Button>
        </form>
      </Card>
        </div>
      </div>
    </div>
  );
}