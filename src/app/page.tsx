
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { WeatherAPIResponse } from '@/types/weather';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { MusicRecommendations } from '@/components/MusicRecommendations';
import { ClothingSuggestions } from '@/components/ClothingSuggestions';
import { FoodSuggestions } from '@/components/FoodSuggestions';
import { MedicalTips } from '@/components/MedicalTips';
import { EmergencyButton } from '@/components/EmergencyButton';
import { WeatherSummary } from '@/components/WeatherSummary'; // Added
import { Loader2, AlertTriangle, Search, LocateFixed, Sun, MapPinned } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionCard } from '@/components/SectionCard';


const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

const NearbySheltersMap = dynamic(
  () => import('@/components/NearbySheltersMap').then(mod => mod.NearbySheltersMap),
  {
    ssr: false,
    loading: () => (
      <SectionCard title="Nearby Facilities" icon={MapPinned}>
        <Skeleton className="h-[400px] w-full rounded-md" />
        <p className="text-center text-muted-foreground mt-2">Loading map...</p>
      </SectionCard>
    )
  }
);


export default function HomePage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherAPIResponse | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocationError = useCallback((err: GeolocationPositionError | Error) => {
    let message = "Unable to retrieve your location. Please enter it manually.";
    if ('message' in err && err.message) {
        if (err.message.includes("User denied Geolocation")) {
            message = "Location access denied. Please enter your location manually or enable access in your browser settings.";
        } else {
            message = `Location error: ${err.message}. Please enter manually.`;
        }
    }
    setError(message);
    setLoadingLocation(false);
    toast({ variant: "destructive", title: "Location Error", description: message });
  }, [toast]);

  const fetchWeather = useCallback(async (query: string) => {
    if (!WEATHER_API_KEY) {
      setError("Weather API key not configured. Weather service unavailable.");
      toast({ variant: "destructive", title: "API Key Missing", description: "Weather service cannot be reached."});
      setLoadingWeather(false);
      return;
    }
    setLoadingWeather(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=3`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Weather API request failed: ${response.statusText}`);
      }
      const data: WeatherAPIResponse = await response.json();
      setWeatherData(data);
      if (data.location) {
        setLocation({latitude: data.location.lat, longitude: data.location.lon});
      }
    } catch (err: any) {
      console.error("Error fetching weather data:", err);
      setError(err.message || "Failed to fetch weather data.");
      toast({ variant: "destructive", title: "Weather Data Error", description: err.message || "Could not load weather information." });
      setWeatherData(null);
    } finally {
      setLoadingWeather(false);
      setLoadingLocation(false);
    }
  }, [toast]);

  const requestGeolocation = useCallback(() => {
    setLoadingLocation(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchWeather(`${latitude},${longitude}`);
        },
        handleLocationError,
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      handleLocationError(new Error("Geolocation is not supported by your browser."));
    }
  }, [fetchWeather, handleLocationError]);


  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLocationInput.trim()) {
      fetchWeather(manualLocationInput.trim());
    } else {
      setError("Please enter a location.");
      toast({variant: "destructive", title: "Input Required", description: "Please enter a city name or zip code."});
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8 relative">
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Sun className="w-10 h-10 md:w-12 md:w-12 mr-3 animate-spin [animation-duration:10s]" /> Weatherwise 2.0
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">Your intelligent weather companion</p>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        {!location && (loadingLocation || loadingWeather) && (
          <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Fetching your location and weather...</p>
          </div>
        )}

        {error && !loadingWeather && (
          <div className="p-6 bg-destructive/10 border border-destructive rounded-lg shadow-md text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive mr-2" />
              <p className="text-destructive font-semibold">{error}</p>
            </div>
          </div>
        )}

        {(!location || error) && !loadingLocation && !loadingWeather && (
          <form onSubmit={handleManualLocationSubmit} className="flex flex-col sm:flex-row gap-2 items-center p-6 bg-card rounded-lg shadow-lg">
            <Input
              type="text"
              value={manualLocationInput}
              onChange={(e) => setManualLocationInput(e.target.value)}
              placeholder="Enter city, zip code, or lat,lon"
              aria-label="Enter location"
              className="flex-grow text-base"
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={loadingWeather}>
              <Search className="mr-2 h-4 w-4" /> Get Weather
            </Button>
            <Button type="button" variant="outline" onClick={requestGeolocation} className="w-full sm:w-auto" disabled={loadingLocation || loadingWeather}>
                <LocateFixed className="mr-2 h-4 w-4" /> Use My Location
            </Button>
          </form>
        )}

        <WeatherDisplay weatherData={weatherData} loading={loadingWeather || (loadingLocation && !weatherData)} />
        
        <WeatherSummary weatherData={weatherData} loadingWeather={loadingWeather || (loadingLocation && !weatherData)} />

        {weatherData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <MusicRecommendations weatherCondition={weatherData.current.condition.text} />
              <ClothingSuggestions
                weatherCondition={weatherData.current.condition.text}
                temperature={weatherData.current.temp_c}
                loading={loadingWeather}
              />
            </div>
            <div className="space-y-8">
              <FoodSuggestions
                weatherCondition={weatherData.current.condition.text}
                temperature={weatherData.current.temp_c}
                loading={loadingWeather}
              />
              <MedicalTips
                weatherCondition={weatherData.current.condition.text}
                temperature={weatherData.current.temp_c}
                loading={loadingWeather}
              />
            </div>
          </div>
        )}

        {isClient && location && <NearbySheltersMap latitude={location.latitude} longitude={location.longitude} />}

      </main>
      <EmergencyButton />
      <footer className="w-full max-w-6xl mt-12 pt-8 border-t border-primary/20 text-center">
        <p className="text-sm text-muted-foreground">
          Weatherwise 2.0 &copy; {new Date().getFullYear()}. Weather data powered by <a href="https://www.weatherapi.com/" title="Free Weather API" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WeatherAPI.com</a>.
        </p>
      </footer>
    </div>
  );
}
