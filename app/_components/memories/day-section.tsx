"use client"; // Handle loading state

import { Badge } from "@/components/ui/badge";
import { MemoryWithUrls } from "@/types/types";
import { Memory } from "./memory";
import { Calendar } from "lucide-react";

export function DaySection({ day }: { day: { creationDate: string; memories: MemoryWithUrls[] } }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4" />
          {day.creationDate}
        </div>

        <Badge variant="secondary" className="text-xs">
          {day.memories.length} {day.memories.length === 1 ? "memory" : "memories"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {day.memories.map((memory) => (
          <Memory key={memory._id} memory={memory} />
        ))}
      </div>
    </div>
  );
}
