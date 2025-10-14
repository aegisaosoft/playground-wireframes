import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface DatesBlockProps {
  data: { startDate: Date | null; endDate: Date | null };
  onChange: (data: { startDate: Date | null; endDate: Date | null }) => void;
}

export const DatesBlock: React.FC<DatesBlockProps> = ({ data, onChange }) => {
  const today = new Date();
  
  const dateRange: DateRange | undefined = data.startDate || data.endDate 
    ? { from: data.startDate || undefined, to: data.endDate || undefined }
    : undefined;

  const handleRangeSelect = (range: DateRange | undefined) => {
    onChange({
      startDate: range?.from || null,
      endDate: range?.to || null,
    });
  };

  const formatDateRange = () => {
    if (!data.startDate && !data.endDate) return 'Select dates';
    if (data.startDate && !data.endDate) return format(data.startDate, 'PPP');
    if (data.startDate && data.endDate) {
      return `${format(data.startDate, 'MMM d')} – ${format(data.endDate, 'MMM d, yyyy')}`;
    }
    return 'Select dates';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-4 h-4 text-neon-orange" />
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Dates</label>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-foreground hover:bg-white/10 focus:border-neon-pink/50",
              !data.startDate && !data.endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-card border-white/10" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            disabled={(date) => date < today}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
