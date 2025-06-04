import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

// Mock data based on slug
const getMockData = (slug: string) => {
  const datePart = slug.split('-').slice(0, 3).join('-');
  
  try {
    const date = new Date(datePart);
    const formattedDate = format(date, 'MMMM d, yyyy');
    
    return {
      date: formattedDate,
      slug,
      image: "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
      message: "Greetings from the coast! I hope you're doing well. This place is so beautiful, I just had to share it with you. Take care and see you soon!",
      meetupPhotos: [
        "https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg",
        "https://images.pexels.com/photos/6146931/pexels-photo-6146931.jpeg"
      ]
    };
  } catch (e) {
    return {
      date: "Unknown date",
      slug,
      image: "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
      message: "Postcard details not found.",
      meetupPhotos: []
    };
  }
};

export default function HistoryPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const data = getMockData(slug);

  return (
    <section className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <i className="ri-postcard-line mr-3 text-blue-600"></i>
        ReTodoku · {data.date}
      </h1>

      {/* postcard detail */}
      <Card className="mb-8 p-6">
        <div className="w-full rounded-lg overflow-hidden mb-4 relative group">
          <img 
            src={data.image} 
            alt="Historic postcard" 
            className="object-cover w-full h-auto rounded-lg" 
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
            <i className="ri-image-line text-gray-600"></i>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground flex items-center mb-2">
            <i className="ri-message-2-line mr-2"></i>
            Message
          </p>
          <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            {data.message}
          </p>
        </div>
      </Card>

      {/* meetup photos if any */}
      {data.meetupPhotos && data.meetupPhotos.length > 0 && (
        <Card className="p-6" id="historyMeetupSection">
          <h2 className="font-semibold mb-4 flex items-center">
            <i className="ri-camera-3-line mr-2 text-purple-600"></i>
            Meetup Moments
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.meetupPhotos.map((photo, idx) => (
              <div key={idx} className="relative group">
              <img 
                src={photo} 
                alt={`History meetup ${idx + 1}`} 
                  className="object-cover w-full h-32 rounded-lg transition-transform group-hover:scale-105" 
              />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <i className="ri-eye-line text-white text-xl"></i>
                </div>
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                  <i className="ri-image-line text-gray-600 text-sm"></i>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 flex items-center">
            <i className="ri-information-line mr-1"></i>
            Photos from your meetup together
          </p>
        </Card>
      )}
    </section>
  );
}