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

  // Use controlled state - always use the value prop if provided, otherwise use internal state
  const currentDate = value || new Date();

  const handleTimeChange = (timeString: string) => {
    if (!timeString || !timeString.includes(":")) return;

    const [hoursStr, minutesStr] = timeString.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return;
    }

    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);
    onChange?.(newDate);
  };

  const getTimeString = () => {
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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
              {currentDate.toLocaleDateString()}
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
              selected={currentDate}
              captionLayout="dropdown"
              disabled={(date) => date > new Date()}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  // Preserve the time when selecting a new date
                  const newDate = new Date(selectedDate);
                  newDate.setHours(
                    currentDate.getHours(),
                    currentDate.getMinutes(),
                    currentDate.getSeconds(),
                    currentDate.getMilliseconds(),
                  );
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
