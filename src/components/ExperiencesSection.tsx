import { useState, useEffect } from "react";
import ExperienceCard from "./ExperienceCard";
import { Button } from "@/components/ui/button";
import { experiencesService } from "@/services/experiences.service";
import { formatExperienceDates } from "@/utils/dateFormatter";

const categoryColorMap: Record<string, "pink" | "cyan" | "yellow" | "purple" | "green" | "orange"> = {
  tech: "cyan",
  wellness: "green",
  business: "purple",
  adventure: "orange",
  culinary: "yellow",
  creative: "pink"
};

const ExperiencesSection = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const data = await experiencesService.getAll();
        
        // Transform API data for ExperienceCard component
        const transformedData = data.slice(0, 3).map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          location: exp.location || 'TBA',
          duration: formatExperienceDates(exp.startDate, exp.endDate, exp.date || exp.dates),
          description: exp.description || exp.shortDescription || '',
          highlights: exp.highlights || [],
          image: exp.image || exp.featuredImageUrl || null,
          category: {
            name: exp.category || 'Experience',
            color: categoryColorMap[exp.categorySlug] || 'pink'
          }
        }));
        
        setExperiences(transformedData);
      } catch (error) {
        console.error('Failed to fetch experiences for homepage:', error);
        setExperiences([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 mb-8">
            <span className="text-neon-purple text-sm font-medium">
              Upcoming Experiences
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-neon-pink">Where ∞ Ideas</span>
            <br />
            <span className="text-neon-yellow">Go IRL</span>
          </h2>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading experiences...</p>
            </div>
          ) : experiences.length > 0 ? (
            experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                {...experience}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No experiences available yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Can't find your vibe? We're always cooking up new experiences.
          </p>
          <Button 
            variant="outline" 
            className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-background font-bold px-8 py-3 rounded-full"
          >
            Suggest an Experience
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;