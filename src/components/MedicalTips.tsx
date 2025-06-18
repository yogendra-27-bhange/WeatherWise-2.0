"use client";

import type { MedicalTip } from "@/lib/suggestions";
import { getMedicalTips, HeartPulse } from "@/lib/suggestions";
import { SectionCard } from "./SectionCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MedicalTipsProps {
  weatherCondition: string | null;
  temperature: number | null;
  loading: boolean;
}

export function MedicalTips({ weatherCondition, temperature, loading }: MedicalTipsProps) {
  if (loading) {
    return (
      <SectionCard title="Health Advisory" icon={HeartPulse}>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
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
      <SectionCard title="Health Advisory" icon={HeartPulse}>
        <p className="text-muted-foreground">Waiting for weather data...</p>
      </SectionCard>
    );
  }

  const tips = getMedicalTips(weatherCondition, temperature);

  return (
    <SectionCard title="Health Advisory" icon={HeartPulse}>
      {tips.length > 0 ? (
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start space-x-3 p-2 bg-background/30 rounded-lg">
              <tip.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <span className="font-medium">{tip.tip}</span>
                <span className="block text-xs text-muted-foreground">({tip.category})</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Stay healthy and safe!</p>
      )}
    </SectionCard>
  );
}
