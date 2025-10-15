import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AgendaItem {
  time: string;
  activity: string;
}

interface AgendaDayBlockProps {
  data: { 
    date: Date | null; 
    scheduleByDate: { [dateString: string]: AgendaItem[] };
  };
  onChange: (data: { 
    date: Date | null; 
    scheduleByDate: { [dateString: string]: AgendaItem[] };
  }) => void;
  dateRange?: { startDate: Date | null; endDate: Date | null };
}

export const AgendaDayBlock: React.FC<AgendaDayBlockProps> = ({ data, onChange, dateRange }) => {
  // Get current date's items
  const currentDateString = data.date ? format(data.date, 'yyyy-MM-dd') : null;
  const currentItems = currentDateString && data.scheduleByDate?.[currentDateString] 
    ? data.scheduleByDate[currentDateString] 
    : [{ time: '09:00', activity: 'Welcome & Introductions' }];

  const addItem = () => {
    if (!currentDateString) return;
    const newItems = [...currentItems, { time: '09:00', activity: 'New Activity' }];
    onChange({ 
      ...data, 
      scheduleByDate: { 
        ...data.scheduleByDate, 
        [currentDateString]: newItems 
      } 
    });
  };

  const removeItem = (index: number) => {
    if (!currentDateString) return;
    const newItems = currentItems.filter((_, i) => i !== index);
    onChange({ 
      ...data, 
      scheduleByDate: { 
        ...data.scheduleByDate, 
        [currentDateString]: newItems 
      } 
    });
  };

  const updateItem = (index: number, field: keyof AgendaItem, value: string) => {
    if (!currentDateString) return;
    const newItems = [...currentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ 
      ...data, 
      scheduleByDate: { 
        ...data.scheduleByDate, 
        [currentDateString]: newItems 
      } 
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-foreground hover:bg-white/10",
                !data.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.date ? format(data.date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-white/10" align="start">
            <Calendar
              mode="single"
              selected={data.date || undefined}
              onSelect={(date) => onChange({ ...data, date: date || null })}
              disabled={(date) => {
                if (!dateRange?.startDate || !dateRange?.endDate) return false;
                return date < dateRange.startDate || date > dateRange.endDate;
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Agenda Items */}
      <div className="space-y-3">
        {currentItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
            <Input
              value={item.time}
              onChange={(e) => updateItem(index, 'time', e.target.value)}
              className="w-20 bg-white/5 border-white/10 text-foreground text-center"
              placeholder="09:00"
            />
            <Input
              value={item.activity}
              onChange={(e) => updateItem(index, 'activity', e.target.value)}
              className="flex-1 bg-white/5 border-white/10 text-foreground"
              placeholder="Activity description"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="text-destructive hover:text-destructive hover:bg-destructive/20 w-8 h-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addItem}
          className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-neon-green/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>
    </div>
  );
};