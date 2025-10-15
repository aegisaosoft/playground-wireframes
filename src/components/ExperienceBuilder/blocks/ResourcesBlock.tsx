import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Folder, Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  type: 'link' | 'file';
}

interface ResourcesBlockProps {
  data: { resources: ResourceItem[] };
  onChange: (data: { resources: ResourceItem[] }) => void;
}

export const ResourcesBlock: React.FC<ResourcesBlockProps> = ({ data, onChange }) => {
  const { toast } = useToast();

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString || urlString.trim() === '') {
      return false;
    }
    
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };

  const openResource = (resource: ResourceItem) => {
    if (!resource.url || resource.url.trim() === '') {
      toast({
        title: "No URL provided",
        description: "Please enter a URL for this resource first.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(resource.url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    // Open in new window
    window.open(resource.url, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Resource opened",
      description: `Opened ${resource.title || 'resource'} in a new window.`,
    });
  };

  const addResource = () => {
    const newResource: ResourceItem = {
      id: `resource-${Date.now()}`,
      title: '',
      url: '',
      description: '',
      type: 'link'
    };
    onChange({ resources: [...(data.resources || []), newResource] });
  };

  const updateResource = (id: string, field: keyof ResourceItem, value: string) => {
    const updatedResources = (data.resources || []).map(resource => 
      resource.id === id ? { ...resource, [field]: value } : resource
    );
    onChange({ resources: updatedResources });
  };

  const deleteResource = (id: string) => {
    const filteredResources = (data.resources || []).filter(resource => resource.id !== id);
    onChange({ resources: filteredResources });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Folder className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-xl font-semibold text-foreground">Resources 📂</h3>
      </div>

      <div className="space-y-4">
        {(data.resources || []).map((resource, index) => (
          <div key={resource.id} className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Resource {index + 1}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteResource(resource.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Resource Name</label>
                <Input
                  value={resource.title}
                  onChange={(e) => updateResource(resource.id, 'title', e.target.value)}
                  className="bg-white/5 border-white/10 text-foreground"
                  placeholder="e.g., Packing List"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Link/URL</label>
                <Input
                  value={resource.url}
                  onChange={(e) => updateResource(resource.id, 'url', e.target.value)}
                  className="bg-white/5 border-white/10 text-foreground"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description (optional)</label>
              <Textarea
                value={resource.description}
                onChange={(e) => updateResource(resource.id, 'description', e.target.value)}
                className="bg-white/5 border-white/10 text-foreground resize-none"
                placeholder="Brief description of this resource..."
                rows={2}
              />
            </div>
          </div>
        ))}

        <Button
          onClick={addResource}
          className="w-full bg-white/5 border border-dashed border-white/20 text-foreground hover:bg-white/10 hover:border-neon-cyan/50"
          variant="ghost"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>

        {/* Preview */}
        {data.resources && data.resources.length > 0 && (
          <div className="p-6 bg-gradient-dark rounded-lg border border-white/10">
            <div className="text-sm font-medium text-foreground mb-3">Preview:</div>
            <div className="space-y-2">
              {data.resources.map((resource) => {
                const hasUrl = resource.url && resource.url.trim() !== '';
                const urlIsValid = hasUrl && isValidUrl(resource.url);
                
                return (
                  <div key={resource.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors">
                    <Folder className="w-4 h-4 text-neon-cyan" />
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground font-medium truncate">
                        {resource.title || 'Untitled Resource'}
                      </div>
                      {resource.description && (
                        <div className="text-muted-foreground text-sm truncate">
                          {resource.description}
                        </div>
                      )}
                      {hasUrl && (
                        <div className={`text-xs truncate ${urlIsValid ? 'text-neon-cyan' : 'text-red-400'}`}>
                          {urlIsValid ? '✓ Valid URL' : '✗ Invalid URL'}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openResource(resource)}
                      disabled={!hasUrl}
                      className={`${
                        urlIsValid 
                          ? 'border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10' 
                          : 'border-white/10 text-muted-foreground hover:text-foreground'
                      } ${!hasUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};