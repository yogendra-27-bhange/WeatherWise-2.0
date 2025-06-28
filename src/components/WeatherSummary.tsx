"use client";

import { useEffect, useState } from 'react';
import type { ConvertedWeatherAPIResponse } from "@/types/yr-weather";
import { generateWeatherSummary, type GenerateWeatherSummaryInput } from '@/ai/flows/generate-weather-summary';
import { SectionCard } from "./SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WeatherSummaryProps {
  weatherData: ConvertedWeatherAPIResponse | null;
  loadingWeather: boolean;
}

export function WeatherSummary({ weatherData, loadingWeather }: WeatherSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (weatherData && weatherData.current && weatherData.location && weatherData.forecast.forecastday[0]) {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        setErrorSummary(null);
        setSummary(null);
        try {
          const input: GenerateWeatherSummaryInput = {
            locationName: weatherData.location.name,
            country: weatherData.location.country,
            currentTempC: weatherData.current.temp_c,
            currentConditionText: weatherData.current.condition.text,
            feelsLikeTempC: weatherData.current.feelslike_c,
            humidity: weatherData.current.humidity,
            windKph: weatherData.current.wind_kph,
            forecastTodayMaxTempC: weatherData.forecast.forecastday[0].day.maxtemp_c,
            forecastTodayMinTempC: weatherData.forecast.forecastday[0].day.mintemp_c,
            forecastTodayConditionText: weatherData.forecast.forecastday[0].day.condition.text,
          };
          const result = await generateWeatherSummary(input);
          setSummary(result.summary);
        } catch (err: any) {
          console.error("Error generating weather summary:", err);
          setErrorSummary(err.message || "Failed to generate weather summary.");
          toast({
            variant: "destructive",
            title: "AI Summary Error",
            description: err.message || "Could not load AI weather summary.",
          });
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [weatherData, toast]);

  if (loadingWeather) {
    return (
      <SectionCard title="AI Weather Snapshot" icon={Sparkles}>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </SectionCard>
    );
  }

  if (!weatherData) {
    return (
      <SectionCard title="AI Weather Snapshot" icon={Sparkles}>
        <p className="text-muted-foreground">Waiting for weather data to generate summary...</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="AI Weather Snapshot" icon={Sparkles}>
      {loadingSummary && (
        <>
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-5/6" />
        </>
      )}
      {errorSummary && !loadingSummary && (
        <div className="flex items-center text-destructive">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{errorSummary}</p>
        </div>
      )}
      {!loadingSummary && !errorSummary && summary && (
        <p className="text-foreground/90 leading-relaxed">{summary}</p>
      )}
      {!loadingSummary && !errorSummary && !summary && !weatherData && (
         <p className="text-muted-foreground">Enter a location to get an AI summary.</p>
      )}
    </SectionCard>
  );
}
