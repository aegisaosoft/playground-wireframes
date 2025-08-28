import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlockProps {
  data: { items: FaqItem[] };
  onChange: (data: { items: FaqItem[] }) => void;
}

export const FaqBlock: React.FC<FaqBlockProps> = ({ data, onChange }) => {
  const addItem = () => {
    const newItems = [...data.items, { question: 'Your question here?', answer: 'Your answer here...' }];
    onChange({ items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({ items: newItems });
  };

  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h3>
      </div>

      <div className="space-y-4">
        {data.items.map((item, index) => (
          <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-foreground">Question</label>
                  <Input
                    value={item.question}
                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                    className="bg-white/5 border-white/10 text-foreground font-medium"
                    placeholder="What should participants expect?"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/20 mt-6 w-8 h-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Answer</label>
                <Textarea
                  value={item.answer}
                  onChange={(e) => updateItem(index, 'answer', e.target.value)}
                  className="bg-white/5 border-white/10 text-foreground resize-none min-h-[80px]"
                  placeholder="Provide a helpful and detailed answer..."
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addItem}
          className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-neon-cyan/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ Item
        </Button>

        {data.items.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No FAQ items yet. Add common questions participants might have!</p>
          </div>
        )}
      </div>
    </div>
  );
};