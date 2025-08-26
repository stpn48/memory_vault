"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { MemoryWithUrls } from "@/types/types";
import { usePaginatedQuery } from "convex/react";
import { Box, Search } from "lucide-react";
import { useState } from "react";
import { DaySection } from "./day-section";

export function Memories() {
  const {
    results: days,
    status,
    loadMore,
  } = usePaginatedQuery(api.memories.getUserMemories, {}, { initialNumItems: 3 });

  const [query, setQuery] = useState("");

  if (status === "LoadingFirstPage") {
    return <LoadingSkeleton />;
  }

  if (days.length === 0) {
    return <EmptyState />;
  }

  const filteredDays = filterByQuery(days, query);

  return (
    <div className="flex flex-col gap-8">
      <SearchBar query={query} setQuery={setQuery} />

      <div className="space-y-8">
        {filteredDays.map((day) => (
          <DaySection key={day.creationDate} day={day} />
        ))}
      </div>

      {status === "CanLoadMore" && <LoadMoreButton loadMore={loadMore} />}
    </div>
  );
}

function SearchBar({ query, setQuery }: { query: string; setQuery: (query: string) => void }) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-background/50 border-muted/50 focus:border-primary/50 placeholder:text-muted-foreground h-12 pl-10"
        placeholder="Search memories or dates..."
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, dayIndex) => (
        <div key={dayIndex} className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Component: Empty State
function EmptyState() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center py-16">
      <div className="space-y-4 text-center">
        <div className="bg-muted/50 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <Box className="text-muted-foreground h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-foreground text-lg font-semibold">No memories yet</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            Start capturing your precious moments by creating your first memory
          </p>
        </div>
      </div>
    </div>
  );
}

// Component: Load More Button
function LoadMoreButton({ loadMore }: { loadMore: (numItems: number) => void }) {
  return (
    <div className="flex justify-center pt-8">
      <button
        onClick={() => loadMore(10)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-3 font-medium shadow-lg transition-all hover:scale-105"
      >
        Load more memories
      </button>
    </div>
  );
}

// Utility: Filter Memories by Query
function filterByQuery(
  days: { creationDate: string; memories: MemoryWithUrls[] }[],
  query: string,
): { creationDate: string; memories: MemoryWithUrls[] }[] {
  // Normalize the query string
  query = query.trim().toLowerCase();

  return days
    .map((day) => {
      // Check if the day matches the query
      const isDateMatch = new Date(day.creationDate)
        .toLocaleDateString(undefined, {
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
        .toString()
        .includes(query);

      if (isDateMatch) {
        return day;
      }

      // Filter memories that match the query
      const filteredMemories = day.memories.filter((memory) =>
        memory.content.trim().toLowerCase().includes(query),
      );

      // Include the day if either the date matches or there are matching memories
      if (filteredMemories.length > 0) {
        return {
          ...day,
          memories: filteredMemories,
        };
      }

      return null; // Exclude days with no matches
    })
    .filter((day) => day !== null) as { creationDate: string; memories: MemoryWithUrls[] }[];
}
