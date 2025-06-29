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
import Header from '@/components/ui/header';

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

// Add a function to determine background gradient based on weather
function getBackgroundGradient(weatherData: ConvertedWeatherAPIResponse | null, theme: 'light' | 'dark') {
  if (!weatherData) {
    return theme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900'
      : 'bg-gradient-to-br from-blue-50 via-white to-blue-100';
  }
  const condition = weatherData.current.condition.text.toLowerCase();
  if (condition.includes('sunny') || condition.includes('clear')) {
    return theme === 'dark'
      ? 'bg-gradient-to-br from-yellow-700 via-gray-900 to-blue-900'
      : 'bg-gradient-to-br from-yellow-200 via-blue-100 to-blue-300';
  }
  if (condition.includes('rain') || condition.includes('shower') || condition.includes('drizzle')) {
    return theme === 'dark'
      ? 'bg-gradient-to-br from-gray-700 via-blue-900 to-gray-900'
      : 'bg-gradient-to-br from-gray-300 via-blue-200 to-blue-400';
  }
  if (condition.includes('cloud')) {
    return theme === 'dark'
      ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700'
      : 'bg-gradient-to-br from-gray-100 via-gray-300 to-blue-200';
  }
  if (condition.includes('snow')) {
    return theme === 'dark'
      ? 'bg-gradient-to-br from-blue-900 via-gray-800 to-white/10'
      : 'bg-gradient-to-br from-white via-blue-100 to-blue-300';
  }
  return theme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900'
    : 'bg-gradient-to-br from-blue-50 via-white to-blue-100';
}

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('en');
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load theme from localStorage if available
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    }
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

  // Handler functions for Header
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };
  const handleLanguageChange = (lang: string) => setLanguage(lang);
  const handleAboutClick = () => setAboutOpen(true);
  const handleSOSClick = () => {
    // Open the EmergencyButton dialog (if needed, can be improved)
    // For now, scroll to Emergency section or show alert
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen text-foreground flex flex-col items-center p-0 md:p-0 relative transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''} ${getBackgroundGradient(weatherData, theme)}`}>
      <Header
        searchValue={manualLocationInput}
        onSearchChange={(e) => setManualLocationInput(e.target.value)}
        onSearchSubmit={handleManualLocationSubmit}
        onSOSClick={handleSOSClick}
        onThemeToggle={handleThemeToggle}
        theme={theme}
        language={language}
        onLanguageChange={handleLanguageChange}
        onAboutClick={handleAboutClick}
      />
      {/* About Us Modal (placeholder) */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setAboutOpen(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-2">About Weatherwise 2.0</h2>
            <p className="text-gray-700 dark:text-gray-200">Your intelligent weather companion. Built with ❤️ for modern, user-friendly weather insights and safety features.</p>
          </div>
        </div>
      )}
      <OfflineSurvivalKit />
      <main className="w-full max-w-6xl px-4 md:px-8 space-y-8 mt-8">
        {/* Weather Main Card + 3-Day Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
              <WeatherDisplay weatherData={weatherData} loading={loadingWeather || (loadingLocation && !weatherData)} />
        </div>
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 mt-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
              <WeatherSummary weatherData={weatherData} loadingWeather={loadingWeather || (loadingLocation && !weatherData)} />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
        <SmartDayPlanner 
            weatherData={weatherData} 
            loadingWeather={loadingWeather || (loadingLocation && !weatherData)}
            onPlanMyDayClick={handlePlanMyDayClick}
            showAdvice={showDayPlanAdvice}
        />
            </div>
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
        <AirQualityAlerts latitude={location?.latitude ?? null} longitude={location?.longitude ?? null} />
            </div>
          </div>
        </div>
        {/* 3-Day Forecast Card (separate for mobile) */}
        <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 md:hidden">
          {/* You can add a mobile-optimized forecast here if needed */}
        </div>
        {/* Suggestions, Music, Food, Medical, etc. */}
        {weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
              <MusicRecommendations weatherCondition={weatherData.current.condition.text} />
            </div>
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
              <ClothingSuggestions
                weatherCondition={weatherData.current.condition.text}
                temperature={weatherData.current.temp_c}
                loading={loadingWeather}
              />
            </div>
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
              <FoodSuggestions
                weatherCondition={weatherData.current.condition.text}
                temperature={weatherData.current.temp_c}
                loading={loadingWeather}
              />
            </div>
            <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
              <MedicalTips
                weatherCondition={weatherData.current.condition.text}
                temperature={weatherData.current.temp_c}
                loading={loadingWeather}
              />
            </div>
          </div>
        )}
        {/* Weather Story, Trends, and Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
            <WeatherStory weatherData={weatherData} loadingWeather={loadingWeather || (loadingLocation && !weatherData)} />
          </div>
          <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
            <WeatherTrendsChart />
          </div>
        </div>
        {/* Nearby Shelters Map */}
        {isClient && location && (
          <div className="rounded-lg shadow-xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in">
            <NearbySheltersMap latitude={location.latitude} longitude={location.longitude} />
          </div>
        )}
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
