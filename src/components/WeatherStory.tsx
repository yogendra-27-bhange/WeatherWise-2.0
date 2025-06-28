"use client";

import { useEffect, useState, useCallback } from 'react';
import type { ConvertedWeatherAPIResponse } from "@/types/yr-weather";
import { generateWeatherStory, type GenerateWeatherStoryInput } from '@/ai/flows/generate-weather-story';
import { SectionCard } from "./SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpenText, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from './ui/button';

interface WeatherStoryProps {
  weatherData: ConvertedWeatherAPIResponse | null;
  loadingWeather: boolean;
}

export function WeatherStory({ weatherData, loadingWeather }: WeatherStoryProps) {
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [errorStory, setErrorStory] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStory = useCallback(async () => {
    if (!weatherData || !weatherData.current || !weatherData.location) {
      setErrorStory("Weather data not available to generate a story.");
      return;
    }
    setLoadingStory(true);
    setErrorStory(null);
    setStory(null);
    try {
      const input: GenerateWeatherStoryInput = {
        locationName: weatherData.location.name,
        currentConditionText: weatherData.current.condition.text,
        temperatureCelcius: weatherData.current.temp_c,
      };
      const result = await generateWeatherStory(input);
      setStory(result.story);
    } catch (err: any) {
      console.error("Error generating weather story:", err);
      setErrorStory(err.message || "Failed to generate weather story.");
      toast({
        variant: "destructive",
        title: "AI Story Error",
        description: err.message || "Could not load AI weather story.",
      });
    } finally {
      setLoadingStory(false);
    }
  }, [weatherData, toast]);

  useEffect(() => {
    if (weatherData && !loadingWeather && !story && !loadingStory && !errorStory) {
      fetchStory();
    }
  }, [weatherData, loadingWeather, fetchStory, story, loadingStory, errorStory]);

  if (loadingWeather && !weatherData) {
    return (
      <SectionCard title="AI Weather Story" icon={BookOpenText}>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </SectionCard>
    );
  }

  if (!weatherData && !loadingWeather) {
    return (
      <SectionCard title="AI Weather Story" icon={BookOpenText}>
        <p className="text-muted-foreground">Waiting for weather data to weave a tale...</p>
      </SectionCard>
    );
  }
  
  return (
    <SectionCard title="AI Weather Story" icon={BookOpenText}>
      {loadingStory && (
        <>
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6 mt-1" />
        </>
      )}
      {errorStory && !loadingStory && (
        <div className="flex items-center text-destructive p-2 bg-destructive/10 rounded-md">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{errorStory}</p>
        </div>
      )}
      {!loadingStory && !errorStory && story && (
        <p className="text-foreground/90 leading-relaxed italic">"{story}"</p>
      )}
      <Button onClick={fetchStory} disabled={loadingStory || loadingWeather || !weatherData} variant="outline" size="sm" className="mt-3">
        <RefreshCw className={`mr-2 h-4 w-4 ${loadingStory ? 'animate-spin' : ''}`} />
        New Story
      </Button>
    </SectionCard>
  );
}
