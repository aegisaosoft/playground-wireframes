import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stars, Plus, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HighlightsBlockProps {
  data: { highlights: string[]; aiSuggestions?: string[] };
  onChange: (data: { highlights: string[]; aiSuggestions?: string[] }) => void;
}

export const HighlightsBlock: React.FC<HighlightsBlockProps> = ({ data, onChange }) => {
  const [newHighlight, setNewHighlight] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock AI suggestions - in production this would call an AI service
  const generateAISuggestions = () => {
    const suggestions = [
      "Morning meditation sessions",
      "Expert-led workshops", 
      "Networking opportunities",
      "Hands-on learning activities",
      "Community building exercises"
    ];
    return suggestions;
  };

  useEffect(() => {
    // Show AI suggestions if we have no highlights yet
    if (data.highlights.length === 0 && !data.aiSuggestions) {
      const suggestions = generateAISuggestions();
      onChange({
        ...data,
        aiSuggestions: suggestions
      });
      setShowSuggestions(true);
    }
  }, []);

  const addHighlight = () => {
    if (newHighlight.trim()) {
      const updatedHighlights = [...data.highlights, newHighlight.trim()];
      onChange({ 
        ...data, 
        highlights: updatedHighlights,
        aiSuggestions: data.aiSuggestions 
      });
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = data.highlights.filter((_, i) => i !== index);
    onChange({ 
      ...data, 
      highlights: updatedHighlights,
      aiSuggestions: data.aiSuggestions 
    });
  };

  const addSuggestion = (suggestion: string) => {
    const updatedHighlights = [...data.highlights, suggestion];
    const remainingSuggestions = data.aiSuggestions?.filter(s => s !== suggestion);
    onChange({ 
      ...data, 
      highlights: updatedHighlights,
      aiSuggestions: remainingSuggestions 
    });
    
    if (remainingSuggestions?.length === 0) {
      setShowSuggestions(false);
    }
  };

  const dismissSuggestions = () => {
    setShowSuggestions(false);
    onChange({
      ...data,
      aiSuggestions: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Stars className="w-5 h-5 text-neon-yellow" />
        <h3 className="text-xl font-semibold text-foreground">What You'll Do</h3>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && data.aiSuggestions && data.aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border border-neon-purple/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <span className="font-medium text-foreground">AI Suggestions</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissSuggestions}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.aiSuggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer bg-white/5 hover:bg-neon-purple/20 border border-neon-purple/30 text-foreground hover:text-neon-purple transition-colors"
                onClick={() => addSuggestion(suggestion)}
              >
                + {suggestion}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click suggestions to add them, or dismiss to create your own.
          </p>
        </div>
      )}

      {/* Current Highlights */}
      {data.highlights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Current Highlights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-gray-800 group">
                <div className="w-2 h-2 bg-neon-pink rounded-full" />
                <span className="text-gray-300 flex-1">{highlight}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHighlight(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Highlight */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Add Highlight</h4>
        <div className="flex gap-2">
          <Input
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
            placeholder="e.g., Expert-led workshops, Networking sessions..."
            className="flex-1 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={addHighlight}
            disabled={!newHighlight.trim()}
            className="bg-neon-pink/20 border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/30"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};