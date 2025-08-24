
import { useState } from "react";
import { useParams } from "react-router-dom";
import HostProfile from "@/pages/HostProfile";
import { Retreat } from "@/components/RetreatGrid";
import { ContentBlock } from "@/components/RichContentEditor";
import retreatBali from "@/assets/retreat-bali.jpg";
import retreatCostaRica from "@/assets/retreat-costa-rica.jpg";
import retreatTulum from "@/assets/retreat-tulum.jpg";
import retreatPortugal from "@/assets/retreat-portugal.jpg";
import retreatSwitzerland from "@/assets/retreat-switzerland.jpg";
import retreatGreece from "@/assets/retreat-greece.jpg";

const initialRetreats: Retreat[] = [
  {
    id: 1,
    image: retreatBali,
    location: "Bali",
    date: "Jan 15–22",
    title: "7-Day Digital Detox & Mindfulness Retreat in Ubud",
    description: "Disconnect from technology and reconnect with yourself in the heart of Bali. This transformative retreat combines mindfulness practices, yoga sessions, and cultural immersion in a serene jungle setting.",
    capacity: 12,
    spotsRemaining: 3,
    price: 1200,
    requiresApplication: true,
    agendaVisibility: 'public',
    agenda: [
      {
        date: "January 15",
        activities: [
          { time: "09:00", title: "Welcome Circle & Introductions", description: "Meet your fellow retreaters and set intentions" },
          { time: "11:00", title: "Mindful Walking in Rice Paddies" },
          { time: "14:00", title: "Lunch & Rest" },
          { time: "16:00", title: "Evening Yoga & Meditation" }
        ]
      },
      {
        date: "January 16",
        activities: [
          { time: "07:00", title: "Sunrise Meditation" },
          { time: "09:00", title: "Breakfast & Journaling Time" },
          { time: "10:30", title: "Local Village Tour" },
          { time: "15:00", title: "Afternoon Rest" },
          { time: "17:00", title: "Sound Healing Session" }
        ]
      }
    ],
    organizer: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg",
      profileLink: "#"
    },
    extendedContent: [
      {
        id: "1",
        type: "heading",
        content: "A Journey of Inner Discovery",
        headingLevel: 2,
        order: 0
      },
      {
        id: "2", 
        type: "text",
        content: "Nestled in the lush jungles of Ubud, this retreat offers you a rare opportunity to step away from the digital world and into a space of profound inner connection. Our carefully designed program combines ancient wisdom with modern mindfulness practices.",
        order: 1
      },
      {
        id: "3",
        type: "image",
        content: "Jungle yoga pavilion",
        imageUrl: retreatBali,
        imageAlt: "Open-air yoga pavilion surrounded by tropical jungle",
        order: 2
      },
      {
        id: "4",
        type: "heading",
        content: "What Makes This Retreat Special",
        headingLevel: 3,
        order: 3
      },
      {
        id: "5",
        type: "bullet_list",
        content: "• Daily sunrise meditation sessions\n• Guided forest walks with mindfulness practices\n• Digital detox support and strategies\n• Traditional Balinese healing ceremonies\n• Organic farm-to-table meals\n• Small group size for personalized attention",
        order: 4
      },
      {
        id: "6",
        type: "text",
        content: "Our retreat location is a hidden gem - a sustainably built eco-resort that harmoniously blends with the natural environment. You'll wake up to the sounds of tropical birds and flowing water, practice yoga in an open-air pavilion overlooking rice terraces, and end each day with sunset meditation.",
        order: 5
      }
    ]
  },
  {
    id: 2,
    image: retreatCostaRica,
    location: "Costa Rica",
    date: "Feb 20–27",
    title: "Pura Vida Adventure & Wellness Retreat",
    description: "Experience the pure life of Costa Rica through adventure activities, wellness practices, and sustainable living workshops.",
    capacity: 15,
    spotsRemaining: 8,
    price: 950,
    requiresApplication: false,
    agendaVisibility: 'private',
    organizer: {
      name: "Carlos Rodriguez",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: 3,
    image: retreatTulum,
    location: "Tulum",
    date: "Mar 10–17",
    title: "Beachfront Yoga & Cenote Healing Experience",
    description: "Combine ancient Mayan wisdom with modern wellness practices on the stunning Caribbean coast.",
    capacity: 20,
    spotsRemaining: 12,
    price: 800,
    requiresApplication: false,
    agendaVisibility: 'public',
    agenda: [
      {
        date: "March 10",
        activities: [
          { time: "08:00", title: "Beach Sunrise Yoga" },
          { time: "10:00", title: "Cenote Swimming & Meditation" }
        ]
      }
    ],
    organizer: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg",
      profileLink: "#"
    }
  },
  {
    id: 4,
    image: retreatPortugal,
    location: "Portugal",
    date: "Apr 1–8",
    title: "Creative Writing & Wine Retreat in Douro Valley",
    description: "Unleash your creativity while enjoying world-class wines in one of Portugal's most beautiful regions.",
    capacity: 10,
    spotsRemaining: 2,
    price: 1400,
    requiresApplication: true,
    agendaVisibility: 'public',
    organizer: {
      name: "Maria Santos",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: 5,
    image: retreatSwitzerland,
    location: "Switzerland",
    date: "Apr 3–10",
    title: "Alpine Startup Founder Retreat",
    description: "Network with fellow entrepreneurs while enjoying the stunning Swiss Alps and world-class business workshops.",
    capacity: 8,
    spotsRemaining: 1,
    price: 2200,
    requiresApplication: true,
    agendaVisibility: 'private',
    organizer: {
      name: "Klaus Mueller",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: 6,
    image: retreatGreece,
    location: "Greece",
    date: "Apr 5–12",
    title: "Digital Nomad Retreat in Mediterranean Paradise",
    description: "Work remotely while enjoying the Greek islands, with coworking sessions and networking opportunities.",
    capacity: 25,
    spotsRemaining: 18,
    price: 650,
    requiresApplication: false,
    agendaVisibility: 'public',
    organizer: {
      name: "Dimitri Papadopoulos",
      avatar: "/placeholder.svg"
    }
  }
];

export const HostProfileWrapper = () => {
  const [savedRetreats, setSavedRetreats] = useState<number[]>([]);
  const [followedHosts, setFollowedHosts] = useState<string[]>([]);

  const handleToggleSaveRetreat = (retreatId: number) => {
    setSavedRetreats(prev => 
      prev.includes(retreatId) 
        ? prev.filter(id => id !== retreatId)
        : [...prev, retreatId]
    );
  };

  const handleToggleFollowHost = (hostName: string) => {
    setFollowedHosts(prev => 
      prev.includes(hostName) 
        ? prev.filter(name => name !== hostName)
        : [...prev, hostName]
    );
  };

  return (
    <HostProfile
      retreats={initialRetreats}
      savedRetreats={savedRetreats}
      onToggleSaveRetreat={handleToggleSaveRetreat}
      followedHosts={followedHosts}
      onToggleFollowHost={handleToggleFollowHost}
    />
  );
};
