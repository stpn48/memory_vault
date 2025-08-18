"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date>(value || new Date());

  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  const handleTimeChange = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0);
    setDate(newDate);
    onChange?.(newDate);
  };

  const getTimeString = () => {
    return date.toTimeString().slice(0, 5);
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" id="date-picker" className="w-32 justify-between font-normal">
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[9999] w-auto overflow-hidden p-0"
            align="start"
            style={{ pointerEvents: "auto" }}
            sideOffset={5}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  // Preserve the time when selecting a new date
                  const newDate = new Date(selectedDate);
                  newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
                  setDate(newDate);
                  onChange?.(newDate);
                }
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={getTimeString()}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
