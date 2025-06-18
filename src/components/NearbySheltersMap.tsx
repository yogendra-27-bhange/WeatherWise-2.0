"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, FullscreenControl } from 'react-map-gl';
import type { MapboxGeocodingResponse, MapboxFeature, Place } from '@/types/mapbox';
import { SectionCard } from "./SectionCard";
import { MapPinned, Hospital, Shield, HomeIcon as ShelterIcon, MapIcon } from 'lucide-react'; // Using HomeIcon as ShelterIcon
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface NearbySheltersMapProps {
  latitude: number | null;
  longitude: number | null;
}

const POI_CATEGORIES = {
  hospital: { name: 'Hospitals', icon: Hospital, color: '#E91E63' }, // Pink
  police: { name: 'Police Stations', icon: Shield, color: '#2196F3' }, // Blue
  shelter: { name: 'Shelters', icon: ShelterIcon, color: '#4CAF50' }, // Green
};

type PoiCategoryKey = keyof typeof POI_CATEGORIES;

export function NearbySheltersMap({ latitude, longitude }: NearbySheltersMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [viewport, setViewport] = useState({
    latitude: latitude || 37.7749, // Default to SF
    longitude: longitude || -122.4194,
    zoom: 12,
    pitch: 45,
    bearing: 0,
  });

  useEffect(() => {
    if (latitude && longitude) {
      setViewport(prev => ({ ...prev, latitude, longitude, zoom: 12 }));
      fetchNearbyPlaces(latitude, longitude);
    }
  }, [latitude, longitude]);

  const fetchNearbyPlaces = useCallback(async (lat: number, lon: number) => {
    if (!MAPBOX_TOKEN) {
      setError("Mapbox token not configured.");
      toast({variant: "destructive", title:"Map Error", description: "Map service is unavailable."});
      return;
    }
    setLoading(true);
    setError(null);
    let allPlaces: Place[] = [];

    try {
      for (const category of Object.keys(POI_CATEGORIES) as PoiCategoryKey[]) {
        const query = POI_CATEGORIES[category].name;
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${lon},${lat}&access_token=${MAPBOX_TOKEN}&limit=5&types=poi`
        );
        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Mapbox API error for ${category}:`, errorData.message || response.statusText);
            continue; // Skip this category on error
        }
        const data: MapboxGeocodingResponse = await response.json();
        const categoryPlaces: Place[] = data.features.map((feature: MapboxFeature) => ({
          id: feature.id,
          name: feature.text,
          coordinates: feature.center as [number, number],
          type: category,
          address: feature.place_name,
        }));
        allPlaces = [...allPlaces, ...categoryPlaces];
      }
      setPlaces(allPlaces);
    } catch (err: any) {
      console.error("Error fetching nearby places:", err);
      setError("Failed to fetch nearby places.");
      toast({variant: "destructive", title: "Map Data Error", description: "Could not load points of interest."});
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const markers = useMemo(() => places.map(place => {
    const CategoryIcon = POI_CATEGORIES[place.type].icon;
    const color = POI_CATEGORIES[place.type].color;
    return (
      <Marker
        key={place.id}
        longitude={place.coordinates[0]}
        latitude={place.coordinates[1]}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setSelectedPlace(place);
        }}
        style={{ cursor: 'pointer' }}
      >
        <CategoryIcon color={color} size={28} className="drop-shadow-md" />
      </Marker>
    );
  }), [places]);


  if (!latitude || !longitude) {
    return (
      <SectionCard title="Nearby Facilities" icon={MapPinned}>
        <p className="text-muted-foreground">Location not available. Please enable location services or enter a location manually.</p>
      </SectionCard>
    );
  }

  if (loading) {
    return (
      <SectionCard title="Nearby Facilities" icon={MapPinned}>
        <Skeleton className="h-[400px] w-full rounded-md" />
      </SectionCard>
    );
  }
  
  if (error) {
     return (
      <SectionCard title="Nearby Facilities" icon={MapPinned}>
        <p className="text-destructive">{error}</p>
        <Button onClick={() => fetchNearbyPlaces(latitude, longitude)} variant="outline" className="mt-2">Retry</Button>
      </SectionCard>
    );
  }


  return (
    <SectionCard title="Nearby Facilities" icon={MapPinned} contentClassName="p-0 md:p-0">
      <div className="h-[400px] md:h-[500px] w-full rounded-b-lg overflow-hidden relative">
        {!MAPBOX_TOKEN && <p className="absolute inset-0 flex items-center justify-center bg-background/80 text-destructive z-10">Map service is unavailable (Missing API Key).</p>}
        {MAPBOX_TOKEN && (
        <Map
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{width: '100%', height: '100%'}}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />
          <FullscreenControl position="top-right" />
          
          {markers}

          {selectedPlace && (
            <Popup
              longitude={selectedPlace.coordinates[0]}
              latitude={selectedPlace.coordinates[1]}
              onClose={() => setSelectedPlace(null)}
              closeButton={true}
              closeOnClick={false}
              anchor="top"
              className="font-body"
            >
              <div className="p-1 max-w-xs">
                <h3 className="font-headline text-md font-semibold text-primary mb-1">{selectedPlace.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{POI_CATEGORIES[selectedPlace.type].name}</p>
                {selectedPlace.address && <p className="text-xs">{selectedPlace.address}</p>}
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-xs mt-1"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.coordinates[1]},${selectedPlace.coordinates[0]}`, "_blank")}
                >
                  Get Directions
                </Button>
              </div>
            </Popup>
          )}
           <Marker longitude={longitude} latitude={latitude}>
             <MapIcon size={32} className="text-accent drop-shadow-lg animate-pulse" />
           </Marker>
        </Map>
        )}
      </div>
    </SectionCard>
  );
}
