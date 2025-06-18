
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import type { MapboxGeocodingResponse, MapboxFeature, Place } from '@/types/mapbox';
import { SectionCard } from "./SectionCard";
import { MapPinned, Hospital, Shield, HomeIcon as ShelterIcon, MapIcon, LucideIcon, Loader2 } from 'lucide-react';
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
    // Only call setView if the map instance is available and center/zoom actually changed
    if (map && (map.getZoom() !== zoom || !map.getCenter().equals(L.latLng(center)))) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}


export function NearbySheltersMap({ latitude, longitude }: NearbySheltersMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [, setSelectedPlace] = useState<Place | null>(null); // Keep for potential future use, not directly for popup control now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // These states are for the ChangeView component to react to prop changes
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(() => latitude && longitude ? [latitude, longitude] : [0,0]);
  const [mapZoom, setMapZoom] = useState(12);

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
            // Don't throw here, try to get other categories
            setError(prevError => prevError ? `${prevError}\nCould not fetch ${category}.` : `Could not fetch ${category}.`);
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
      if (allPlaces.length === 0 && !error) { // if no places found but no API error occurred.
        setError("No nearby facilities found for the selected categories.");
      }
    } catch (err: any) {
      console.error("Error fetching nearby places:", err);
      setError("Failed to fetch nearby places.");
      toast({variant: "destructive", title: "Map Data Error", description: "Could not load points of interest."});
    } finally {
      setLoading(false);
    }
  }, [toast, error]); // Added error to dependency array of fetchNearbyPlaces

  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude]);
      setMapZoom(12); // Reset zoom or adjust as needed when location changes
      fetchNearbyPlaces(latitude, longitude);
    }
  }, [latitude, longitude, fetchNearbyPlaces]);


  const poiMarkers = useMemo(() => places.map(place => {
    const CategoryIcon = POI_CATEGORIES[place.type].icon;
    const color = POI_CATEGORIES[place.type].color;
    const icon = createLeafletIcon(CategoryIcon, color);
    const position: LatLngExpression = [place.coordinates[1], place.coordinates[0]]; 
    
    return (
      <Marker
        key={place.id}
        position={position}
        icon={icon}
        eventHandlers={{
          click: () => {
            setSelectedPlace(place); // Set for potential external use
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
    // This case is handled by the dynamic import's loading if page.tsx calls it when lat/lon are null.
    // However, if called directly with null lat/lon, this is a fallback.
    return (
      <SectionCard title="Nearby Facilities" icon={MapPinned}>
        <p className="text-muted-foreground">Location not available. Please enable location services or enter a location manually.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Nearby Facilities" icon={MapPinned} contentClassName="p-0 md:p-0">
      <div className="h-[400px] md:h-[500px] w-full rounded-b-lg overflow-hidden relative">
        <MapContainer 
            center={mapCenter} // Use state that's updated by useEffect based on props
            zoom={mapZoom}     // Use state that's updated by useEffect
            scrollWheelZoom={true} 
            style={{height: '100%', width: '100%'}}
            className="rounded-b-lg"
            // Adding a key ensures that if lat/lon fundamentally change, Leaflet reinitializes cleanly.
            // This is often a good pattern for components managing heavy external libraries.
            key={`${latitude}-${longitude}`} 
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {poiMarkers}

          <Marker position={[latitude, longitude]} icon={userLocationIcon}>
            <Popup>Your current location</Popup>
          </Marker>

        </MapContainer>
        
        {/* Loading indicator for POIs, shown as an overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading facilities...</p>
          </div>
        )}

        {/* Error display for POIs, shown as an overlay */}
        {error && !loading && places.length === 0 && ( // Show error only if not loading AND no places are shown
          <div className="absolute inset-x-0 top-0 p-4 bg-destructive/20 text-center z-10">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button onClick={() => fetchNearbyPlaces(latitude, longitude)} variant="outline" size="sm" className="mt-2 border-destructive text-destructive hover:bg-destructive/20">
              Retry
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

