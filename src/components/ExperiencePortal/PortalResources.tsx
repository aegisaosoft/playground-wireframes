import { useState } from 'react';
import { Link, FileText, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ResourceItem } from '@/types/experiencePortal';

interface PortalResourcesProps {
  userRole: 'organizer' | 'co-host' | 'attendee' | 'pending';
}

// Mock data
const mockResources: ResourceItem[] = [
  {
    id: '1',
    title: 'Packing List & Preparation Guide',
    url: 'https://notion.so/desert-code-camp-packing',
    description: 'Essential items to bring for the desert experience',
    type: 'link',
    addedBy: 'Alex Chen',
    addedAt: new Date('2024-03-10')
  },
  {
    id: '2',
    title: 'WhatsApp Backup Group',
    url: 'https://chat.whatsapp.com/backup-group',
    description: 'Backup communication channel',
    type: 'link', 
    addedBy: 'Alex Chen',
    addedAt: new Date('2024-03-12')
  },
  {
    id: '3',
    title: 'Technical Setup Instructions',
    url: 'https://github.com/desert-camp/setup',
    description: 'Development environment setup for workshops',
    type: 'link',
    addedBy: 'Mike Johnson',
    addedAt: new Date('2024-03-13')
  }
];

export const PortalResources = ({ userRole }: PortalResourcesProps) => {
  const [resources, setResources] = useState<ResourceItem[]>(mockResources);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    description: ''
  });

  const isHost = userRole === 'organizer' || userRole === 'co-host';

  const handleAddResource = () => {
    if (!newResource.title || !newResource.url) return;

    const resource: ResourceItem = {
      id: Date.now().toString(),
      title: newResource.title,
      url: newResource.url,
      description: newResource.description,
      type: 'link',
      addedBy: 'You',
      addedAt: new Date()
    };

    setResources(prev => [...prev, resource]);
    setNewResource({ title: '', url: '', description: '' });
    setIsAddingResource(false);
  };

  const removeResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="w-5 h-5 text-neon-purple" />;
      default:
        return <Link className="w-5 h-5 text-neon-cyan" />;
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Resources & Links</CardTitle>
          {isHost && (
            <Dialog open={isAddingResource} onOpenChange={setIsAddingResource}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-neon hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add New Resource</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title" className="text-foreground">Title</Label>
                    <Input
                      id="title"
                      value={newResource.title}
                      onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Packing List"
                      className="bg-white/5 border-white/20 text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url" className="text-foreground">URL</Label>
                    <Input
                      id="url"
                      value={newResource.url}
                      onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                      className="bg-white/5 border-white/20 text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-foreground">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={newResource.description}
                      onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description..."
                      className="bg-white/5 border-white/20 text-foreground"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleAddResource}
                      disabled={!newResource.title || !newResource.url}
                      className="flex-1 bg-gradient-neon hover:opacity-90"
                    >
                      Add Resource
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingResource(false)}
                      className="border-white/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {resources.length === 0 ? (
          <div className="text-center py-8">
            <Link className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No resources yet</h3>
            <p className="text-muted-foreground text-sm">
              {isHost 
                ? "Share useful links and files with attendees." 
                : "The host will share helpful resources here."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div 
                key={resource.id}
                className="flex items-start gap-3 p-4 bg-card border border-gray-800 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(resource.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1 truncate">
                        {resource.title}
                      </h4>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Added by {resource.addedBy}</span>
                        <span>•</span>
                        <span>{formatDate(resource.addedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-foreground hover:bg-white/10"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      
                      {isHost && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeResource(resource.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};