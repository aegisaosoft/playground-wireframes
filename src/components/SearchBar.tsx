import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const SearchBar = () => {
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [vibe, setVibe] = useState("");

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Where */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Where
            </label>
            <Input
              placeholder="Search destinations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-gray-300 focus:border-coral focus:ring-coral"
            />
          </div>

          {/* When */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              When (month)
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-300 hover:border-coral",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMMM yyyy") : "Pick a month"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Vibe */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Vibe
            </label>
            <Select value={vibe} onValueChange={setVibe}>
              <SelectTrigger className="border-gray-300 focus:border-coral focus:ring-coral">
                <SelectValue placeholder="Select retreat type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="web3">Web3</SelectItem>
                <SelectItem value="nomad">Digital Nomad</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0 pt-6">
            <Button
              className="bg-coral hover:bg-coral-dark text-white p-3 rounded-xl"
              size="icon"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};