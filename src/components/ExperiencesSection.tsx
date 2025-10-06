import ExperienceCard from "./ExperienceCard";
import { Button } from "@/components/ui/button";
import retreatBali from "@/assets/retreat-bali.jpg";
import retreatCostaRica from "@/assets/retreat-costa-rica.jpg";
import retreatTulum from "@/assets/retreat-tulum.jpg";
import retreatPortugal from "@/assets/retreat-portugal.jpg";
import retreatSwitzerland from "@/assets/retreat-switzerland.jpg";
import retreatGreece from "@/assets/retreat-greece.jpg";

const experiences = [
  {
    id: 1,
    title: "Desert Code Camp",
    location: "Joshua Tree, CA",
    duration: "5 days",
    description: "Build your startup under the stars. Code by day, campfire talks by night.",
    highlights: [
      "Star-gazing sessions",
      "Sunrise yoga",
      "Technical workshops"
    ],
    image: retreatBali,
    category: { name: "Hacker House", color: "pink" as const }
  },
  {
    id: 2,
    title: "Tokyo Street Tech",
    location: "Shibuya, Japan",
    duration: "7 days",
    description: "Immerse in Tokyo's underground tech scene. Street art meets code.",
    highlights: [
      "Underground tech tours",
      "Local maker spaces",
      "Neon district exploration"
    ],
    image: retreatCostaRica,
    category: { name: "Creative Collective", color: "cyan" as const }
  },
  {
    id: 3,
    title: "Bali Builder Retreat",
    location: "Canggu, Bali",
    duration: "14 days",
    description: "Tropical productivity paradise. Build your next big thing by the beach.",
    highlights: [
      "Beachside coworking",
      "Sunset surfing",
      "Meditation sessions"
    ],
    image: retreatTulum,
    category: { name: "Digital Nomad Hub", color: "yellow" as const }
  }
];

const ExperiencesSection = () => {
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
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              {...experience}
            />
          ))}
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