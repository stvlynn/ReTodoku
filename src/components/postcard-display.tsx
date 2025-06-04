import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface PostcardDisplayProps {
  image: string;
  message: string;
  sender: {
    name: string;
    avatar?: string;
    handle: string;
  };
  recipient: {
    name: string;
    avatar?: string;
    handle: string;
  };
  meetupPhotos?: string[];
}

export function PostcardDisplay({
  image,
  message,
  sender,
  recipient,
  meetupPhotos,
}: PostcardDisplayProps) {
  return (
    <section className="max-w-6xl mx-auto p-8 grid lg:grid-cols-[2fr_1fr] gap-8 items-start">
      {/* LEFT: postcard image */}
      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center shadow">
        <img
          src={image || "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg"}
          alt="Postcard"
          className="object-cover w-full h-full rounded-lg"
        />
      </div>

      {/* RIGHT: info stack */}
      <div className="flex flex-col gap-4">
        {/* Sender */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={sender.avatar} alt={sender.name} />
              <AvatarFallback>{getInitials(sender.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sender</p>
              <p className="font-semibold">{sender.handle}</p>
            </div>
          </div>
        </Card>

        {/* Recipient */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={recipient.avatar} alt={recipient.name} />
              <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Recipient
              </p>
              <p className="font-semibold">{recipient.handle}</p>
            </div>
          </div>
        </Card>

        {/* Message */}
        <Card className="p-4">
          <h2 className="font-semibold mb-2">Message</h2>
          <p className="whitespace-pre-wrap">{message}</p>
        </Card>
      </div>

      {/* Meetup moments (render only when photos exist) */}
      {meetupPhotos && meetupPhotos.length > 0 && (
        <section className="max-w-6xl mx-auto lg:col-span-2">
          <Card className="p-4">
            <h2 className="font-semibold mb-4">Meetup Moments</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {meetupPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Meetup photo ${index + 1}`}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
              ))}
            </div>
          </Card>
        </section>
      )}
    </section>
  );
}