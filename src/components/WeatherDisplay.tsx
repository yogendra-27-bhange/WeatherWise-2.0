"use client";

import type { ConvertedWeatherAPIResponse } from "@/types/yr-weather";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton }
from "@/components/ui/skeleton";
import Image from 'next/image';
import { Thermometer, Wind, Droplets, Gauge, CalendarDays, Sunrise, Sunset, Eye, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { WeatherIcon } from '@/lib/suggestions';


interface WeatherDisplayProps {
  weatherData: ConvertedWeatherAPIResponse | null;
  loading: boolean;
}

export function WeatherDisplay({ weatherData, loading }: WeatherDisplayProps) {
  if (loading) {
    return (
      <div className="glass-card w-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
          </div>
          <div>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-28 rounded-md flex-shrink-0" />
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    );
  }

  if (!weatherData) {
    return (
       <div className="glass-card w-full">
        <CardHeader>
          <CardTitle>Weather Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Enter a location or allow access to display weather data.</p>
        </CardContent>
      </div>
    );
  }

  const { current, location, forecast } = weatherData;

  return (
    <div className="glass-card w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl md:text-4xl font-headline text-primary flex items-center">
          <MapPin className="mr-2 h-7 w-7" /> {location.name}, {location.country}
        </CardTitle>
        <CardDescription className="text-foreground/80 text-sm md:text-base">
          Last updated: {format(new Date(current.last_updated), "PPP p")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex flex-col items-center text-center">
             <Image 
                src={`https:${current.condition.icon}`} 
                alt={current.condition.text} 
                width={128} 
                height={128} 
                className="drop-shadow-lg"
                unoptimized={true} 
                data-ai-hint="weather icon"
              />
            <p className="text-6xl md:text-7xl font-bold text-primary">{current.temp_c}°C</p>
            <p className="text-xl md:text-2xl text-foreground/90 capitalize">{current.condition.text}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:text-base w-full md:w-auto">
            <InfoItem icon={Thermometer} label="Feels Like" value={`${current.feelslike_c}°C`} />
            <InfoItem icon={Wind} label="Wind" value={`${current.wind_kph} km/h ${current.wind_dir}`} />
            <InfoItem icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
            <InfoItem icon={Gauge} label="Pressure" value={`${current.pressure_mb} mb`} />
            <InfoItem icon={Eye} label="Visibility" value={`${current.vis_km} km`} />
            <InfoItem icon={Sunrise} label="UV Index" value={`${current.uv}`} />
          </div>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-3 font-headline text-primary">3-Day Forecast</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecast.forecastday.slice(0, 3).map((day) => (
              <div key={day.date_epoch} className="glass-card p-4 bg-white/30 dark:bg-blue-900/40 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <p className="font-semibold text-base md:text-lg">{format(new Date(day.date_epoch * 1000), "EEEE")}</p>
                  <p className="text-xs text-foreground/70 mb-1">{format(new Date(day.date_epoch * 1000), "MMM d")}</p>
                  <Image 
                    src={`https:${day.day.condition.icon}`} 
                    alt={day.day.condition.text} 
                    width={64} 
                    height={64}
                    unoptimized={true} 
                    data-ai-hint="weather forecast icon"
                    className="drop-shadow-sm"
                  />
                  <p className="text-lg md:text-xl font-bold text-primary">{day.day.maxtemp_c}°C / {day.day.mintemp_c}°C</p>
                  <p className="text-xs md:text-sm text-foreground/80 capitalize truncate w-full">{day.day.condition.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {forecast.forecastday[0] && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
             <InfoItem icon={Sunrise} label="Sunrise" value={forecast.forecastday[0].astro.sunrise} />
             <InfoItem icon={Sunset} label="Sunset" value={forecast.forecastday[0].astro.sunset} />
          </div>
        )}

      </CardContent>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-background/30 rounded-lg shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-xs text-foreground/70">{label}</p>
        <p className="font-semibold text-foreground/90">{value}</p>
      </div>
    </div>
  );
}
