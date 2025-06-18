"use client";

import type { Suggestion } from "@/lib/suggestions";
import { getClothingSuggestions, Shirt } from "@/lib/suggestions";
import { SectionCard } from "./SectionCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ClothingSuggestionsProps {
  weatherCondition: string | null;
  temperature: number | null;
  loading: boolean;
}

export function ClothingSuggestions({ weatherCondition, temperature, loading }: ClothingSuggestionsProps) {
  if (loading) {
    return (
      <SectionCard title="Clothing Suggestions" icon={Shirt}>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }
  
  if (!weatherCondition || temperature === null) {
    return (
      <SectionCard title="Clothing Suggestions" icon={Shirt}>
        <p className="text-muted-foreground">Waiting for weather data...</p>
      </SectionCard>
    );
  }

  const suggestions = getClothingSuggestions(weatherCondition, temperature);

  return (
    <SectionCard title="Clothing Suggestions" icon={Shirt}>
      {suggestions.length > 0 ? (
        <ul className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center space-x-3 p-2 bg-background/30 rounded-lg">
              <suggestion.icon className="h-6 w-6 text-primary flex-shrink-0" />
              <span>{suggestion.item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No specific clothing suggestions for the current weather. Dress comfortably!</p>
      )}
    </SectionCard>
  );
}
