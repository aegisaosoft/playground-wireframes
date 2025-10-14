import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface DatesBlockProps {
  data: { startDate: string | null; endDate: string | null };
  onChange: (data: { startDate: string | null; endDate: string | null }) => void;
}

export const DatesBlock: React.FC<DatesBlockProps> = ({ data, onChange }) => {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (data.startDate && data.endDate) {
      return {
        from: new Date(data.startDate),
        to: new Date(data.endDate),
      };
    }
    return undefined;
  });

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
      onChange({
        startDate: newDate.from.toISOString(),
        endDate: newDate.to.toISOString(),
      });
    } else if (newDate?.from) {
      onChange({
        startDate: newDate.from.toISOString(),
        endDate: null,
      });
    } else {
      onChange({
        startDate: null,
        endDate: null,
      });
    }
  };

  const formatDateRange = () => {
    if (date?.from) {
      if (date.to) {
        return `${format(date.from, 'MMMM d')} – ${format(date.to, 'MMMM d, yyyy')}`;
      }
      return format(date.from, 'MMMM d, yyyy');
    }
    return 'Select dates';
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">Dates</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal h-12 text-base bg-white/5 border-white/10 hover:bg-white/10',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5" />
            <span className={cn(date?.from && 'text-foreground font-medium')}>
              {formatDateRange()}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};