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
      className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-neon-pink/50 hover:scale-105 hover:shadow-neon"
      onClick={onClick}
    >
      {/* Image - 4:3 ratio with center crop */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        
        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors z-10 border border-border"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isSaved 
                ? 'fill-neon-pink text-neon-pink' 
                : 'text-muted-foreground hover:text-neon-pink'
            }`}
          />
        </button>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-neon-cyan transition-colors">
          {title}
        </h3>
        
        {organizer && (
          <div className="text-sm text-muted-foreground mb-3">
            <span>Hosted by: </span>
            <button 
              className="text-neon-pink hover:text-neon-cyan hover:underline font-medium transition-colors"
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
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-neon-cyan" />
            {location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-neon-yellow" />
            {date}
          </div>
        </div>
      </div>
    </div>
  );
};