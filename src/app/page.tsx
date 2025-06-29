"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ConvertedWeatherAPIResponse } from '@/types/yr-weather';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { MusicRecommendations } from '@/components/MusicRecommendations';
import { ClothingSuggestions } from '@/components/ClothingSuggestions';
import { FoodSuggestions } from '@/components/FoodSuggestions';
import { MedicalTips } from '@/components/MedicalTips';
import { EmergencyButton } from '@/components/EmergencyButton';
import { WeatherSummary } from '@/components/WeatherSummary';
import { SmartDayPlanner } from '@/components/SmartDayPlanner';
import { BatterySaverAlert } from '@/components/BatterySaverAlert';
import { WeatherStory } from '@/components/WeatherStory';
import { OfflineSurvivalKit } from '@/components/OfflineSurvivalKit';
import { AirQualityAlerts } from '@/components/AirQualityAlerts';
import { Loader2, AlertTriangle, Search, LocateFixed, Sun, MapPinned, Route, Languages, ShieldCheck, UserCheck, Stethoscope, MessageCircleQuestion, LinkIcon, CalendarClock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionCard } from '@/components/SectionCard';
import WeatherTrendsChart from '../components/WeatherTrendsChart';
import DarkModeToggle from '../components/DarkModeToggle';
import { getYrWeather } from '@/lib/yr-weather-service';
import { geocodeLocation, reverseGeocode } from '@/lib/geocoding-service';
import AIWeatherBot from "@/components/AIWeatherBot";

// Remove the API key requirement since Yr.no is free
// const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

const OpenStreetMap = dynamic(() => import('../components/OpenStreetMap'), { ssr: false });
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
  const [weatherData, setWeatherData] = useState<ConvertedWeatherAPIResponse | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [showDayPlanAdvice, setShowDayPlanAdvice] = useState(false);
  const [userStatus, setUserStatus] = useState<string>("Safe"); // For "Mark Me Safe" and QR
  const [showSpecialMap, setShowSpecialMap] = useState(false);

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
    setLoadingWeather(true);
    setError(null);
    setShowDayPlanAdvice(false); // Reset advice visibility on new fetch
    
    try {
      let lat: number, lon: number, locationName: string, country: string;
      
      // Check if query is coordinates
      if (query.includes(',')) {
        const [latStr, lonStr] = query.split(',').map(s => s.trim());
        lat = parseFloat(latStr);
        lon = parseFloat(lonStr);
        
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error('Invalid coordinates format. Use "latitude,longitude"');
        }
        
        // Get location name from coordinates
        const geoResult = await reverseGeocode(lat, lon);
        locationName = geoResult?.name || 'Unknown Location';
        country = geoResult?.country || 'Unknown';
      } else {
        // Geocode the location name to get coordinates
        const geoResult = await geocodeLocation(query);
        if (!geoResult) {
          throw new Error(`Location "${query}" not found. Please try a different location.`);
        }
        
        lat = geoResult.lat;
        lon = geoResult.lon;
        locationName = geoResult.name;
        country = geoResult.country;
      }
      
      // Fetch weather data from Yr.no
      const data = await getYrWeather(lat, lon, locationName, country);
      setWeatherData(data);
      setLocation({ latitude: lat, longitude: lon });
      
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
      toast({variant: "destructive", title: "Input Required", description: "Please enter a city name or coordinates."});
    }
  };

  const handlePlanMyDayClick = () => {
    setShowDayPlanAdvice(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8 relative">
      <OfflineSurvivalKit />
      <header className="w-full max-w-6xl mb-8 text-center">
        <div className="flex justify-end items-center w-full mb-2 gap-4">
          <DarkModeToggle />
          <EmergencyButton latitude={location?.latitude ?? null} longitude={location?.longitude ?? null} currentStatus={userStatus} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Sun className="w-10 h-10 md:w-12 md:w-12 mr-3 animate-spin [animation-duration:10s]" /> Weatherwise 2.0
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">Your intelligent weather companion</p>
        <form onSubmit={handleManualLocationSubmit} className="flex flex-col sm:flex-row gap-2 items-center justify-center mt-4">
          <Input
            type="text"
            value={manualLocationInput}
            onChange={(e) => setManualLocationInput(e.target.value)}
            placeholder="Enter city name or coordinates (lat,lon)"
            aria-label="Enter location"
            className="flex-grow text-base max-w-xs"
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={loadingWeather}>
            <Search className="mr-2 h-4 w-4" /> Get Weather
          </Button>
        </form>
      </header>
       
      <BatterySaverAlert weatherData={weatherData} />

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

        <WeatherDisplay weatherData={weatherData} loading={loadingWeather || (loadingLocation && !weatherData)} />
        
        <WeatherSummary weatherData={weatherData} loadingWeather={loadingWeather || (loadingLocation && !weatherData)} />
        
        <SmartDayPlanner 
            weatherData={weatherData} 
            loadingWeather={loadingWeather || (loadingLocation && !weatherData)}
            onPlanMyDayClick={handlePlanMyDayClick}
            showAdvice={showDayPlanAdvice}
        />

        <WeatherStory weatherData={weatherData} loadingWeather={loadingWeather || (loadingLocation && !weatherData)} />
        
        <AirQualityAlerts latitude={location?.latitude ?? null} longitude={location?.longitude ?? null} />


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

        {/* --- New Features Start --- */}
        <SectionCard title="Weather-Based Reminder System" icon={CalendarClock}>
          <form className="flex flex-col md:flex-row gap-2 items-center">
            <Input type="text" placeholder="Enter reminder (e.g. Take umbrella if rain)" className="flex-grow" />
            <Button type="submit">Set Reminder</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">Reminders will be triggered based on weather conditions.</p>
        </SectionCard>

        <SectionCard title="Multi-Language Support" icon={Languages}>
          <div className="flex gap-4 items-center">
            <Button variant="outline">English</Button>
            <Button variant="outline">हिन्दी</Button>
            <Button variant="outline">मराठी</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Switch app language. (Basic demo, full translation coming soon!)</p>
        </SectionCard>

        <SectionCard title="AI Weather Bot" icon={MessageCircleQuestion}>
          <div className="flex flex-col gap-2">
            <div className="bg-muted p-4 rounded-lg min-h-[80px]">AI Bot: Hello! Ask me anything about the weather.</div>
            <form className="flex gap-2">
              <Input type="text" placeholder="Type your weather question..." className="flex-grow" />
              <Button type="submit">Send</Button>
            </form>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Conversational weather assistant (demo, AI integration coming soon).</p>
        </SectionCard>
        {/* --- New Features End --- */}

        {/* Special Map Overlay Toggle */}
        <div className="flex flex-col items-center my-8">
          <Button onClick={() => setShowSpecialMap((v) => !v)}>
            {showSpecialMap ? "Hide Special Map Overlay" : "Show Special Map Overlay"}
          </Button>
          {showSpecialMap && (
            <div className="w-full mt-4">
              <OpenStreetMap />
            </div>
          )}
        </div>

      </main>
      <footer className="w-full max-w-6xl mt-12 pt-8 border-t border-primary/20 text-center">
        <p className="text-sm text-muted-foreground">
          Weatherwise 2.0 &copy; {new Date().getFullYear()}. Weather data powered by <a href="https://www.met.no/en" title="Norwegian Meteorological Institute" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MET Norway (Yr.no)</a>.
        </p>
      </footer>
      {/* Floating AI Weather Bot */}
      <AIWeatherBot />
    </div>
  );
}
