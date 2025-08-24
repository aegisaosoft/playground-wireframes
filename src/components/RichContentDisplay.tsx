import { ContentBlock } from "./RichContentEditor";
import { cn } from "@/lib/utils";

interface RichContentDisplayProps {
  blocks: ContentBlock[];
  className?: string;
}

export const RichContentDisplay = ({ blocks, className }: RichContentDisplayProps) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className={cn("text-muted-foreground text-center py-8", className)}>
        <p>No extended content available for this retreat.</p>
      </div>
    );
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        // Check if this is a divider block
        if (block.content === '---DIVIDER---') {
          return (
            <div className="flex items-center justify-center my-8">
              <div className="w-full h-px bg-border"></div>
            </div>
          );
        }
        
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {block.content}
            </p>
          </div>
        );

      case 'heading':
        const HeadingTag = `h${block.headingLevel || 2}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: "text-2xl font-bold text-foreground mb-4",
          2: "text-xl font-semibold text-foreground mb-3",
          3: "text-lg font-medium text-foreground mb-2"
        }[block.headingLevel || 2];

        return (
          <HeadingTag className={headingClasses}>
            {block.content}
          </HeadingTag>
        );

      case 'image':
        if (!block.imageUrl) return null;
        return (
          <div className="my-6">
            <img
              src={block.imageUrl}
              alt={block.imageAlt || "Retreat content image"}
              className="w-full rounded-lg object-cover max-h-96"
            />
            {block.imageAlt && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {block.imageAlt}
              </p>
            )}
          </div>
        );

      case 'bullet_list':
        const items = block.content
          .split('\n')
          .filter(item => item.trim())
          .map(item => item.replace(/^[•\-\*]\s*/, '').trim());

        if (items.length === 0) return null;

        return (
          <ul className="space-y-2 pl-6">
            {items.map((item, index) => (
              <li key={index} className="text-foreground list-disc">
                {item}
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {sortedBlocks.map((block) => (
        <div key={block.id}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
};