"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import type { MapboxGeocodingResponse, MapboxFeature, Place } from '@/types/mapbox';
import { SectionCard } from "./SectionCard";
import { MapPinned, Hospital, Shield, HomeIcon as ShelterIcon, MapIcon, LucideIcon } from 'lucide-react';
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

const createLeafletIcon = (IconComponent: LucideIcon, color: string, size: number = 28) => {
  const iconHtml = ReactDOMServer.renderToStaticMarkup(
    <IconComponent color={color} size={size} className="drop-shadow-md" />
  );
  return L.divIcon({
    html: iconHtml,
    className: 'leaflet-custom-div-icon', 
    iconSize: [size, size],
    iconAnchor: [size / 2, size], 
    popupAnchor: [0, -size] 
  });
};

const userLocationIcon = L.divIcon({
  html: ReactDOMServer.renderToStaticMarkup(
    <MapIcon size={32} className="text-accent drop-shadow-lg animate-pulse" />
  ),
  className: 'leaflet-user-location-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Component to handle map view changes
function ChangeView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}


export function NearbySheltersMap({ latitude, longitude }: NearbySheltersMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(
    latitude && longitude ? [latitude, longitude] : [37.7749, -122.4194] // Default to SF
  );
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude]);
      setMapZoom(12);
      fetchNearbyPlaces(latitude, longitude);
    }
  }, [latitude, longitude]);

  const fetchNearbyPlaces = useCallback(async (lat: number, lon: number) => {
    if (!MAPBOX_TOKEN) {
      setError("Mapbox token not configured for POI data.");
      toast({variant: "destructive", title:"Map Data Error", description: "POI service is unavailable."});
      setLoading(false);
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
            continue; 
        }
        const data: MapboxGeocodingResponse = await response.json();
        const categoryPlaces: Place[] = data.features.map((feature: MapboxFeature) => ({
          id: feature.id,
          name: feature.text,
          coordinates: feature.center as [number, number], // [lon, lat]
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

  const poiMarkers = useMemo(() => places.map(place => {
    const CategoryIcon = POI_CATEGORIES[place.type].icon;
    const color = POI_CATEGORIES[place.type].color;
    const icon = createLeafletIcon(CategoryIcon, color);
    // Leaflet uses [lat, lon]
    const position: LatLngExpression = [place.coordinates[1], place.coordinates[0]]; 
    
    return (
      <Marker
        key={place.id}
        position={position}
        icon={icon}
        eventHandlers={{
          click: () => {
            setSelectedPlace(place);
            // Optionally, fly to the marker
            // const map = (document.querySelector('.leaflet-container') as any)?._leaflet_map;
            // if (map) map.flyTo(position, map.getZoom());
          },
        }}
      >
        <Popup>
          <div className="p-1 max-w-xs font-body">
            <h3 className="font-headline text-md font-semibold text-primary mb-1">{place.name}</h3>
            <p className="text-xs text-muted-foreground mb-1">{POI_CATEGORIES[place.type].name}</p>
            {place.address && <p className="text-xs">{place.address}</p>}
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs mt-1"
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates[1]},${place.coordinates[0]}`, "_blank")}
            >
              Get Directions
            </Button>
          </div>
        </Popup>
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

  if (loading && places.length === 0) { // Show skeleton only on initial load
    return (
      <SectionCard title="Nearby Facilities" icon={MapPinned}>
        <Skeleton className="h-[400px] w-full rounded-md" />
      </SectionCard>
    );
  }
  
  if (error && places.length === 0) { // Show error only if no places could be fetched
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
        <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true} 
            style={{height: '100%', width: '100%'}}
            className="rounded-b-lg"
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {poiMarkers}

          <Marker position={[latitude, longitude]} icon={userLocationIcon} />

          {selectedPlace && (
             <Popup 
                position={[selectedPlace.coordinates[1], selectedPlace.coordinates[0]]}
                onClose={() => setSelectedPlace(null)}
              >
              <div className="p-1 max-w-xs font-body">
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

        </MapContainer>
        {loading && <div className="absolute top-2 right-2 bg-background/80 p-2 rounded-md shadow-md"><Skeleton className="h-5 w-20" /></div>}
      </div>
    </SectionCard>
  );
}
