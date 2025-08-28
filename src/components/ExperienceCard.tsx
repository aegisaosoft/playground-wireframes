import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExperienceCardProps {
  id: number;
  title: string;
  location: string;
  duration: string;
  description: string;
  highlights: string[];
  image: string;
  category: {
    name: string;
    color: 'pink' | 'cyan' | 'yellow' | 'purple' | 'green' | 'orange';
  };
  onClick?: () => void;
}

const categoryColors = {
  pink: 'bg-neon-pink text-background',
  cyan: 'bg-neon-cyan text-background', 
  yellow: 'bg-neon-yellow text-background',
  purple: 'bg-neon-purple text-background',
  green: 'bg-neon-green text-background',
  orange: 'bg-neon-orange text-background'
};

const ExperienceCard = ({ 
  id,
  title, 
  location, 
  duration, 
  description, 
  highlights, 
  image, 
  category,
  onClick 
}: ExperienceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/experience/${id}`);
  };
  return (
    <div 
      className="group relative bg-card border border-gray-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-gray-700 hover:scale-105"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[category.color]}`}>
            {category.name}
          </span>
        </div>

        {/* Duration badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-background/80 text-foreground backdrop-blur-sm">
            {duration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Location */}
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-neon-cyan transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Highlights */}
        <div className="mb-4">
          <div className="text-sm font-medium text-foreground mb-2">Highlights:</div>
          <ul className="space-y-1">
            {highlights.slice(0, 3).map((highlight, index) => (
              <li key={index} className="flex items-center text-xs text-gray-400">
                <div className="w-1 h-1 bg-neon-pink rounded-full mr-2"></div>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;