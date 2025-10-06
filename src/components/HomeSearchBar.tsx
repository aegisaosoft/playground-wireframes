import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const exampleSearches = [
  "hacker house in Bali",
  "yoga retreat India", 
  "founder offsite Lisbon"
];

const quickChips = [
  "Hacker House",
  "Wellness", 
  "AI",
  "Surf",
  "Bali",
  "Lisbon"
];

export const HomeSearchBar = () => {
  const [query, setQuery] = useState("");
  const [placeholderExample, setPlaceholderExample] = useState(exampleSearches[0]);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Rotate placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderExample(prev => {
        const currentIndex = exampleSearches.indexOf(prev);
        return exampleSearches[(currentIndex + 1) % exampleSearches.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore invalid JSON
      }
    }
  }, []);

  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    
    saveSearch(query);
    navigate(`/experiences?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      if (isListening) {
        stopListening();
      }
      setIsFocused(false);
    }
  };

  const startListening = () => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      
      // Auto-submit after voice input
      setTimeout(() => {
        saveSearch(transcript);
        navigate(`/experiences?q=${encodeURIComponent(transcript)}`);
      }, 300);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error !== "aborted" && event.error !== "no-speech") {
        toast({
          title: "Voice search failed",
          description: "Please try again or type your search.",
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleChipClick = (chip: string) => {
    saveSearch(chip);
    navigate(`/experiences?q=${encodeURIComponent(chip)}`);
  };

  const handleRecentClick = (search: string) => {
    navigate(`/experiences?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="w-full max-w-[880px] mx-auto px-6 md:px-0">
      <div className="relative">
        {/* Main Search Input */}
        <div className="relative">
          <div 
            className={cn(
              "relative rounded-full overflow-hidden transition-all duration-300",
              "bg-card/50 backdrop-blur-sm",
              "border border-border/50",
              isFocused && "border-neon-cyan/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]"
            )}
          >
            {/* Search Icon */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Input */}
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search experiences…"
              className={cn(
                "w-full h-14 md:h-16 pl-14 pr-20 text-base md:text-lg",
                "bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60"
              )}
              aria-label="Search experiences"
            />

            {/* Mic Button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full",
                isListening && "bg-neon-pink/20 text-neon-pink animate-pulse"
              )}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              aria-pressed={isListening}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>

          {/* Helper Text */}
          <div className="absolute left-14 -bottom-6 text-xs text-muted-foreground/60 transition-opacity duration-300">
            <span className="inline-block animate-pulse">e.g., {placeholderExample}</span>
          </div>
        </div>

        {/* Recent Searches Dropdown */}
        {isFocused && recentSearches.length > 0 && (
          <div className="absolute top-full mt-10 w-full bg-card border border-border rounded-2xl p-3 shadow-xl z-50">
            <div className="text-xs text-muted-foreground mb-2 px-2">Recent searches</div>
            <div className="space-y-1">
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentClick(search)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/50 text-sm transition-colors"
                >
                  <Search className="w-3 h-3 inline mr-2 text-muted-foreground" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <div className="absolute top-full mt-10 left-1/2 -translate-x-1/2 bg-card border border-neon-pink/50 rounded-full px-6 py-3 shadow-neon">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse"></div>
              <span className="text-sm text-neon-pink font-medium">Listening…</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-12">
        {quickChips.map((chip) => (
          <Badge
            key={chip}
            variant="outline"
            className="cursor-pointer border-border/50 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 transition-all px-4 py-1.5"
            onClick={() => handleChipClick(chip)}
          >
            {chip}
          </Badge>
        ))}
      </div>
    </div>
  );
};
