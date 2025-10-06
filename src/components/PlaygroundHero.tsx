import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedTypingText } from "@/components/AnimatedTypingText";
import { AuthModal } from "@/components/AuthModal";
import { HomeSearchBar } from "@/components/HomeSearchBar";

const PlaygroundHero = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; profile?: any } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: { name: string; email: string; profile?: any }) => {
    setUser(userData);
  };

  const handleGetEarlyAccess = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-4 h-4 bg-neon-pink rounded-full animate-pulse shadow-neon"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-neon-cyan rounded-full animate-pulse delay-300 shadow-cyan"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-neon-yellow rounded-full animate-pulse delay-700 shadow-yellow"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-neon-purple rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Announcement banner */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30 mb-12">
          <span className="text-neon-pink text-sm font-medium">
            🚀 Now accepting applications for Q1 2025 experiences
          </span>
        </div>

        {/* Main headline */}
        <div className="space-y-6 mb-12">
          <h1 className="text-6xl md:text-8xl font-bold leading-tight">
            <span className="text-neon-pink">Where </span>
            <span className="text-neon-yellow">∞</span>
            <br />
            <span className="bg-gradient-to-r from-neon-yellow to-neon-orange bg-clip-text text-transparent">
              Ideas Go
            </span>
            <br />
            <span className="text-neon-cyan">IRL.</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <HomeSearchBar />
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="bg-neon-pink hover:bg-neon-purple text-background font-bold text-lg px-12 py-6 rounded-full shadow-neon transition-all duration-300 hover:scale-105"
            onClick={handleGetEarlyAccess}
          >
            Get Early Access
          </Button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default PlaygroundHero;