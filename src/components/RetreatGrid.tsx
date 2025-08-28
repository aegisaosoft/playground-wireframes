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
  savedRetreats: number[];
  onToggleSaveRetreat: (retreatId: number) => void;
}

export const RetreatGrid = ({ retreats, savedRetreats, onToggleSaveRetreat }: RetreatGridProps) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Retreat Yourself
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#1A1A1A' }}>
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
              retreatId={retreat.id}
              isSaved={savedRetreats.includes(retreat.id)}
              onToggleSave={() => onToggleSaveRetreat(retreat.id)}
              organizer={retreat.organizer}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-2 rounded-full"
          >
            See more retreats
          </Button>
        </div>
      </div>
    </section>
  );
};