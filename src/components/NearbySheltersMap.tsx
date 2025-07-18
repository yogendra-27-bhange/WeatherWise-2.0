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

const INITIAL_MAP_ZOOM = 12;

const POI_CATEGORIES = {
  hospital: { name: 'Hospitals', icon: Hospital, color: '#E91E63' },
  police: { name: 'Police Stations', icon: Shield, color: '#2196F3' },
  shelter: { name: 'Shelters', icon: ShelterIcon, color: '#4CAF50' },
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

function ChangeView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const newCenterLatLng = L.latLng(center as L.LatLngTuple);

    if (currentZoom !== zoom || !currentCenter.equals(newCenterLatLng, 0.00001)) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

interface NearbySheltersMapProps {
  latitude: number;
  longitude: number;
}

export function NearbySheltersMap({ latitude, longitude }: NearbySheltersMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);
  const [poiError, setPoiError] = useState<string | null>(null);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const currentMapCenter = useMemo<LatLngExpression>(() => {
    return [latitude, longitude];
  }, [latitude, longitude]);

  const fetchNearbyPlaces = useCallback(async (lat: number, lon: number) => {
    setLoadingPois(true);
    setPoiError(null);
    let allPlaces: Place[] = [];

    // Overpass QL queries for each category
    const overpassQueries: Record<PoiCategoryKey, string> = {
      hospital: `node[amenity=hospital](around:3000,${lat},${lon});`,
      police: `node[amenity=police](around:3000,${lat},${lon});`,
      shelter: `node[amenity=shelter](around:3000,${lat},${lon});`,
    };

    try {
      for (const category of Object.keys(POI_CATEGORIES) as PoiCategoryKey[]) {
        const query = overpassQueries[category];
        const url = `https://overpass-api.de/api/interpreter?data=[out:json];(${query});out body;`;
        const response = await fetch(url);
        if (!response.ok) {
          setPoiError(prev => `${prev ? prev + '\n' : ''}Could not fetch ${category}.`);
          continue;
        }
        const data = await response.json();
        const categoryPlaces: Place[] = (data.elements || []).map((el: any) => ({
          id: `${category}-${el.id}`,
          name: el.tags?.name || POI_CATEGORIES[category].name,
          coordinates: [el.lon, el.lat],
          type: category,
          address: el.tags?.address || '',
        }));
        allPlaces = [...allPlaces, ...categoryPlaces];
      }
      setPlaces(allPlaces);
      if (allPlaces.length === 0 && !poiError) {
        setPoiError("No nearby facilities found for the selected categories.");
      }
    } catch (err) {
      console.error("Error fetching nearby places:", err);
      setPoiError("Failed to fetch nearby places.");
      toast({ variant: "destructive", title: "Map Data Error", description: "Could not load points of interest." });
    } finally {
      setLoadingPois(false);
    }
  }, [toast]);

  useEffect(() => {
    if (latitude && longitude) {
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

  if (!mounted) return null;

  return (
    <SectionCard title="Nearby Facilities" icon={MapPinned} contentClassName="p-0 md:p-0">
      <div className="h-[400px] md:h-[500px] w-full rounded-b-lg overflow-hidden relative">
        <MapContainer
          key={`leaflet-map-${latitude}-${longitude}`}
          center={currentMapCenter}
          zoom={INITIAL_MAP_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="rounded-b-lg"
        >
          <ChangeView center={currentMapCenter} zoom={INITIAL_MAP_ZOOM} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {poiMarkers}

          <Marker position={currentMapCenter} icon={userLocationIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        </MapContainer>

        {loadingPois && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading facilities...</p>
          </div>
        )}

        {poiError && !loadingPois && places.length === 0 && (
          <div className="absolute inset-x-0 top-0 p-4 bg-destructive/20 text-center z-10 rounded-t-lg">
            <p className="text-sm text-destructive font-medium whitespace-pre-line">{poiError}</p>
            <Button onClick={() => fetchNearbyPlaces(latitude, longitude)} variant="outline" size="sm" className="mt-2 border-destructive text-destructive hover:bg-destructive/20">
              Retry
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
