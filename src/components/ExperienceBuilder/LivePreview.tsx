import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Copy, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Block } from '@/types/experienceBuilder';

interface LivePreviewProps {
  blocks: Block[];
  isPublic: boolean;
  onToggleVisibility: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onBack?: () => void;
  onInlineEdit?: (blockId: string, field: string, value: any) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  blocks,
  isPublic,
  onToggleVisibility,
  onSaveDraft,
  onPublish,
  onBack,
  onInlineEdit,
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const titleBlock = blocks.find(b => b.type === 'title');
  const datesBlock = blocks.find(b => b.type === 'dates');
  const locationBlock = blocks.find(b => b.type === 'location');
  const richTextBlock = blocks.find(b => b.type === 'richText');
  const highlightsBlock = blocks.find(b => b.type === 'highlights');
  const agendaBlocks = blocks.filter(b => b.type === 'agendaDay');
  const ticketsBlock = blocks.find(b => b.type === 'tickets');
  const galleryBlock = blocks.find(b => b.type === 'gallery');
  const faqBlock = blocks.find(b => b.type === 'faq');
  const logisticsBlock = blocks.find(b => b.type === 'logistics');
  const ctaBlock = blocks.find(b => b.type === 'cta');

  const canPublish = titleBlock?.data.text && datesBlock?.data.startDate && locationBlock?.data.city;

  const copyLink = () => {
    const link = isPublic 
      ? `${window.location.origin}/experience/${titleBlock?.data.text?.toLowerCase().replace(/\s+/g, '-')}`
      : `${window.location.origin}/experience/private/${Date.now()}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleVisibility}
              className="gap-2"
            >
              {isPublic ? (
                <>
                  <Eye className="w-4 h-4" />
                  Public
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Private
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={copyLink}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSaveDraft}>
            Save Draft
          </Button>
          <Button 
            size="sm" 
            onClick={onPublish}
            disabled={!canPublish}
            className="bg-primary text-primary-foreground"
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Live Preview Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Title Section */}
          <div
            className="relative group"
            onMouseEnter={() => setHoveredBlock('title')}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {hoveredBlock === 'title' && onInlineEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {titleBlock?.data.text || 'Untitled Experience'}
            </h1>
          </div>

          {/* Dates & Location */}
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {datesBlock?.data.startDate && (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {new Date(datesBlock.data.startDate).toLocaleDateString()}
                  {datesBlock.data.endDate && 
                    ` - ${new Date(datesBlock.data.endDate).toLocaleDateString()}`}
                </span>
              </div>
            )}
            {locationBlock?.data.city && (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {locationBlock.data.city}
                  {locationBlock.data.country && `, ${locationBlock.data.country}`}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {richTextBlock?.data.content && (
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed">
                {richTextBlock.data.content}
              </p>
            </div>
          )}

          {/* Highlights */}
          {highlightsBlock?.data.highlights?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">Highlights</h2>
              <ul className="space-y-2">
                {highlightsBlock.data.highlights.map((highlight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Agenda */}
          {agendaBlocks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Schedule</h2>
              {agendaBlocks.map((block, idx) => (
                <div key={block.id} className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">
                    Day {idx + 1}
                  </h3>
                  <div className="space-y-2">
                    {block.data.items?.map((item: any, itemIdx: number) => (
                      <div key={itemIdx} className="flex gap-4">
                        <span className="text-sm text-muted-foreground w-20">
                          {item.time}
                        </span>
                        <span className="text-sm text-foreground">
                          {item.activity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tickets */}
          {ticketsBlock?.data.tiers?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Tickets</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {ticketsBlock.data.tiers.map((tier: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground">{tier.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">
                      ${tier.price}
                    </p>
                    {tier.quantity && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {tier.quantity} spots available
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {faqBlock?.data.items?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
              <div className="space-y-3">
                {faqBlock.data.items.map((item: any, idx: number) => (
                  <div key={idx} className="border-b border-border pb-3">
                    <h3 className="font-medium text-foreground mb-1">
                      {item.question}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {ctaBlock?.data.text && (
            <div className="flex justify-center pt-8">
              <Button size="lg" className="bg-primary text-primary-foreground">
                {ctaBlock.data.text}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {blocks.length <= 3 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Start chatting to build your experience...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};