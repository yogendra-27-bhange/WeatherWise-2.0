
"use client";

import { useState, useCallback, useEffect } from 'react';
import type { WeatherAPIResponse } from "@/types/weather";
import { generateDayPlanAdvice, type GenerateDayPlanAdviceInput } from '@/ai/flows/generate-day-plan-advice';
import { SectionCard } from "./SectionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SmartDayPlannerProps {
  weatherData: WeatherAPIResponse | null;
  loadingWeather: boolean;
  onPlanMyDayClick: () => void;
  showAdvice: boolean;
}

export function SmartDayPlanner({ weatherData, loadingWeather, onPlanMyDayClick, showAdvice }: SmartDayPlannerProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [errorAdvice, setErrorAdvice] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAdvice = useCallback(async () => {
    if (!weatherData || !weatherData.current || !weatherData.location || !weatherData.forecast.forecastday[0]) {
      setErrorAdvice("Weather data not complete enough to generate advice.");
      return;
    }
    setLoadingAdvice(true);
    setErrorAdvice(null);
    setAdvice(null);
    try {
      const forecastDay = weatherData.forecast.forecastday[0];
      const input: GenerateDayPlanAdviceInput = {
        locationName: weatherData.location.name,
        currentTempC: weatherData.current.temp_c,
        currentConditionText: weatherData.current.condition.text,
        feelsLikeTempC: weatherData.current.feelslike_c,
        humidity: weatherData.current.humidity,
        windKph: weatherData.current.wind_kph,
        uvIndex: weatherData.current.uv,
        forecastTodayMaxTempC: forecastDay.day.maxtemp_c,
        forecastTodayMinTempC: forecastDay.day.mintemp_c,
        forecastTodayConditionText: forecastDay.day.condition.text,
        chanceOfRainToday: forecastDay.day.daily_chance_of_rain,
        // Basic rain time detection (can be improved)
        expectedRainTime: forecastDay.hour.find(h => h.chance_of_rain > 50 && new Date(h.time_epoch * 1000).getHours() >= new Date().getHours())?.time.split(' ')[1]
      };
      const result = await generateDayPlanAdvice(input);
      setAdvice(result.advice);
    } catch (err: any) {
      console.error("Error generating day plan advice:", err);
      setErrorAdvice(err.message || "Failed to generate day plan advice.");
      toast({
        variant: "destructive",
        title: "AI Planner Error",
        description: err.message || "Could not load planning advice.",
      });
    } finally {
      setLoadingAdvice(false);
    }
  }, [weatherData, toast]);

  // Fetch advice automatically if showAdvice is true and weather data is available
  // This is triggered by the "Plan My Day" button in the parent
  // This useEffect was removed in a previous step as it was combined, re-evaluating its necessity.
  // useEffect(() => {
  //   if (showAdvice && weatherData && !loadingWeather) {
  //     fetchAdvice();
  //   }
  // });

   // Re-fetch if showAdvice becomes true and data is ready
  useEffect(() => {
    if (showAdvice && weatherData && !loadingWeather && !advice && !loadingAdvice && !errorAdvice) {
      fetchAdvice();
    }
  }, [showAdvice, weatherData, loadingWeather, advice, loadingAdvice, errorAdvice, fetchAdvice]);


  return (
    <SectionCard title="Smart Day Planner" icon={Lightbulb}>
      <Button onClick={() => { onPlanMyDayClick(); fetchAdvice(); }} disabled={loadingWeather || loadingAdvice} className="mb-4 w-full sm:w-auto">
        {loadingAdvice ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
        {advice || errorAdvice ? "Refresh My Plan" : "📝 Plan My Day"}
      </Button>

      {showAdvice && (
        <>
          {loadingAdvice && (
            <>
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-5/6" />
            </>
          )}
          {errorAdvice && !loadingAdvice && (
            <div className="flex items-center text-destructive p-2 bg-destructive/10 rounded-md">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{errorAdvice}</p>
            </div>
          )}
          {!loadingAdvice && !errorAdvice && advice && (
            <div className="p-3 bg-primary/10 rounded-md shadow">
                <p className="text-foreground/90 leading-relaxed">{advice}</p>
            </div>
          )}
          {!loadingAdvice && !errorAdvice && !advice && !weatherData && (
             <p className="text-muted-foreground">Click "Plan My Day" once weather data is loaded.</p>
          )}
        </>
      )}
      {!showAdvice && !weatherData && (
        <p className="text-muted-foreground">Load weather data to enable day planning.</p>
      )}
       {!showAdvice && weatherData && (
        <p className="text-muted-foreground">Click "📝 Plan My Day" for personalized advice.</p>
      )}
    </SectionCard>
  );
}
