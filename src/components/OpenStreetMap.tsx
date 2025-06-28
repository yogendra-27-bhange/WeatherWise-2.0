import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MAPTILER_API_KEY = 'NdNJ1m1o2DxzW9NGLPcG';
const MAPTILER_URL = `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;
const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const DEFAULT_POSITION: [number, number] = [28.6139, 77.2090]; // Delhi as fallback

function LiveLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        map.setView(coords, 13);
      },
      () => {
        setPosition(DEFAULT_POSITION);
        map.setView(DEFAULT_POSITION, 13);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map]);

  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>
        <div>
          <b>Your Live Location 📍</b>
          <br />
          <span>Lat: {position[0].toFixed(5)}, Lon: {position[1].toFixed(5)}</span>
        </div>
      </Popup>
    </Marker>
  );
}

// Example: Add more markers here in the future
const customMarkers: { position: [number, number]; label: string }[] = [
  // { position: [28.61, 77.21], label: 'Custom Marker 1' },
];

export default function OpenStreetMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={DEFAULT_POSITION}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-b-lg"
      >
        <TileLayer
          attribution={MAPTILER_ATTRIBUTION}
          url={MAPTILER_URL}
        />
        <LiveLocationMarker />
        {/* Render custom markers here */}
        {customMarkers.map((marker, idx) => (
          <Marker key={idx} position={marker.position as [number, number]}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 