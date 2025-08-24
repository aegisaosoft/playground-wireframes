import { Heart, MapPin, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface RetreatCardProps {
  image: string;
  location: string;
  date: string;
  title: string;
  onClick: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  organizer?: {
    name: string;
    avatar?: string;
  };
}

export const RetreatCard = ({ image, location, date, title, onClick, isSaved, onToggleSave, organizer }: RetreatCardProps) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Trigger login modal - for now we'll just show alert
      alert('Please log in to save retreats');
      return;
    }
    onToggleSave();
  };
  return (
    <div 
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isSaved 
                ? 'fill-coral text-coral' 
                : 'text-gray-600 hover:text-coral'
            }`}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{title}</h3>
        
        {organizer && (
          <div className="text-sm text-muted-foreground mb-2">
            <span>Hosted by: </span>
            <button 
              className="text-coral hover:underline font-medium"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to host profile - would need router navigation in real app
                window.location.href = `/host/${organizer.name.toLowerCase().replace(/\s+/g, '-')}`;
              }}
            >
              {organizer.name}
            </button>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            {location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {date}
          </div>
        </div>
      </div>
    </div>
  );
};