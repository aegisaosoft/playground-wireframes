import { RetreatCard } from "./RetreatCard";
import { Button } from "@/components/ui/button";
import { ContentBlock } from "./RichContentEditor";

export interface Retreat {
  id: number;
  image: string;
  location: string;
  date: string;
  title: string;
  description?: string;
  capacity?: number;
  spotsRemaining?: number;
  agendaVisibility?: 'public' | 'private';
  agenda?: Array<{
    date: string;
    activities: Array<{
      time: string;
      title: string;
      description?: string;
    }>;
  }>;
  organizer?: {
    name: string;
    avatar?: string;
    profileLink?: string;
  };
  price?: number;
  requiresApplication?: boolean;
  extendedContent?: ContentBlock[];
  isPublished?: boolean; // Controls whether retreat is live or in draft mode
  isPublic?: boolean; // Controls visibility when published (homepage vs direct link only)
}

interface RetreatGridProps {
  retreats: Retreat[];
  onRetreatClick: (retreat: Retreat) => void;
  savedRetreats: number[];
  onToggleSaveRetreat: (retreatId: number) => void;
}

export const RetreatGrid = ({ retreats, onRetreatClick, savedRetreats, onToggleSaveRetreat }: RetreatGridProps) => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 mb-8">
            <span className="text-neon-cyan text-sm font-medium">
              Featured Retreats
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-neon-cyan">Retreat</span>{" "}
            <span className="text-neon-pink">Yourself</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover curated retreats around the world. Connect, grow, and transform with like-minded adventurers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {retreats.map((retreat) => (
            <RetreatCard
              key={retreat.id}
              image={retreat.image}
              location={retreat.location}
              date={retreat.date}
              title={retreat.title}
              onClick={() => onRetreatClick(retreat)}
              isSaved={savedRetreats.includes(retreat.id)}
              onToggleSave={() => onToggleSaveRetreat(retreat.id)}
              organizer={retreat.organizer}
            />
          ))}
        </div>
        
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Ready to find your perfect retreat experience?
          </p>
          <Button 
            variant="outline" 
            className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-background font-bold px-8 py-3 rounded-full transition-all duration-300"
          >
            See more retreats
          </Button>
        </div>
      </div>
    </section>
  );
};