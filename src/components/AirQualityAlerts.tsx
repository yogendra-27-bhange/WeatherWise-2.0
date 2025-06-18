"use client";

import { useState, useEffect } from 'react';
import { SectionCard } from "./SectionCard";
import { Wind, AlertTriangle, CloudFog } from 'lucide-react'; // Changed Leaf to CloudFog for AQI
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Placeholder for AQI API response structure
interface AqiData {
  aqi: number;
  pollutant?: string; // Dominant pollutant
  healthConcern?: string;
  recommendation?: string;
}

const AQI_API_KEY = process.env.NEXT_PUBLIC_AQI_API_KEY;

interface AirQualityAlertsProps {
  latitude: number | null;
  longitude: number | null;
}

export function AirQualityAlerts({ latitude, longitude }: AirQualityAlertsProps) {
  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (latitude && longitude) {
      // setLoading(true);
      // setError(null);

      // --- Placeholder for actual API call ---
      // This is where you would fetch data from an AQI API
      // For example:
      // fetch(`https://api.aqi_provider.com/v1/feed/geo:${latitude};${longitude}/?token=${AQI_API_KEY}`)
      //   .then(res => res.json())
      //   .then(data => {
      //     if (data.status === "ok") {
      //       setAqiData({ 
      //         aqi: data.data.aqi,
      //         // ... map other relevant fields
      //         healthConcern: "Placeholder: Health concern based on AQI " + data.data.aqi,
      //         recommendation: "Placeholder: Recommendation for AQI " + data.data.aqi
      //       });
      //     } else {
      //       throw new Error(data.data || "Failed to fetch AQI data");
      //     }
      //   })
      //   .catch(err => {
      //     console.error("AQI API error:", err);
      //     setError(err.message || "Could not load Air Quality Index.");
      //     toast({ variant: "destructive", title: "AQI Error", description: err.message });
      //   })
      //   .finally(() => setLoading(false));

      // Using placeholder data for now:
      if (!AQI_API_KEY) {
         setError("AQI API key not configured. Air quality service unavailable.");
         setAqiData(null);
      } else {
        // Simulate an API call with a delay
        setLoading(true);
        setTimeout(() => {
          const mockAqi = Math.floor(Math.random() * 300); // Random AQI for demo
          setAqiData({
            aqi: mockAqi,
            pollutant: "PM2.5 (Mock)",
            healthConcern: mockAqi > 150 ? "Unhealthy. Reduce prolonged or heavy exertion outdoors." : (mockAqi > 100 ? "Unhealthy for Sensitive Groups" : "Good to Moderate"),
            recommendation: mockAqi > 150 ? "Consider wearing a mask if outside for extended periods." : "Enjoy your day!"
          });
          setLoading(false);
        }, 1500);
      }
    } else {
      setAqiData(null);
      setError(null);
    }
  }, [latitude, longitude, toast]);

  const getAqiColorClass = (aqi: number | undefined): string => {
    if (aqi === undefined) return "text-muted-foreground";
    if (aqi <= 50) return "text-green-500";
    if (aqi <= 100) return "text-yellow-500";
    if (aqi <= 150) return "text-orange-500";
    if (aqi <= 200) return "text-red-500";
    if (aqi <= 300) return "text-purple-500";
    return "text-maroon-500"; // (Should be a Tailwind color or custom)
  };


  if (!latitude || !longitude) {
    return (
      <SectionCard title="Air Quality & Alerts" icon={CloudFog}>
        <p className="text-muted-foreground">Waiting for location to fetch air quality data...</p>
      </SectionCard>
    );
  }
  
  if (loading) {
    return (
      <SectionCard title="Air Quality & Alerts" icon={CloudFog}>
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2" />
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Air Quality & Alerts" icon={CloudFog}>
        <div className="flex items-center text-destructive">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </SectionCard>
    );
  }
  
  if (!aqiData && !AQI_API_KEY) {
     return (
      <SectionCard title="Air Quality & Alerts" icon={CloudFog}>
        <div className="flex items-center text-orange-500">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>AQI API Key not configured. This feature is disabled.</p>
        </div>
      </SectionCard>
    );
  }


  if (!aqiData) {
    return (
      <SectionCard title="Air Quality & Alerts" icon={CloudFog}>
        <p className="text-muted-foreground">No air quality data available for your location currently.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Air Quality & Alerts" icon={CloudFog}>
      <div className="space-y-2">
        <p className="text-lg">
          Current Air Quality Index (AQI): <span className={`font-bold ${getAqiColorClass(aqiData.aqi)}`}>{aqiData.aqi}</span>
          {aqiData.pollutant && <span className="text-sm text-muted-foreground"> (Dominant: {aqiData.pollutant})</span>}
        </p>
        {aqiData.healthConcern && <p><span className="font-medium">Health Concern:</span> {aqiData.healthConcern}</p>}
        {aqiData.recommendation && <p><span className="font-medium">Recommendation:</span> {aqiData.recommendation}</p>}
        
        {/* Placeholder for other alerts like Fire, Heatwave - would require more data sources */}
        <div className="mt-3 pt-3 border-t">
            <h4 className="font-medium text-sm text-muted-foreground">Other Alerts:</h4>
            <p className="text-xs text-muted-foreground italic">Fire, Heatwave alerts integration pending additional data sources.</p>
        </div>
      </div>
    </SectionCard>
  );
}
