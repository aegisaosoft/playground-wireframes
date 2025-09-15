import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatesBlockProps {
  data: { startDate: Date | null; endDate: Date | null };
  onChange: (data: { startDate: Date | null; endDate: Date | null }) => void;
}

export const DatesBlock: React.FC<DatesBlockProps> = ({ data, onChange }) => {
  const today = new Date();
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-foreground hover:bg-white/10",
                  !data.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.startDate ? format(data.startDate, "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-white/10" align="start">
              <Calendar
                mode="single"
                selected={data.startDate || undefined}
                onSelect={(date) => onChange({ ...data, startDate: date || null })}
                disabled={(date) => date < today}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-foreground hover:bg-white/10",
                  !data.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.endDate ? format(data.endDate, "PPP") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-white/10" align="start">
              <Calendar
                mode="single"
                selected={data.endDate || undefined}
                onSelect={(date) => onChange({ ...data, endDate: date || null })}
                disabled={(date) => date < (data.startDate || today)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};