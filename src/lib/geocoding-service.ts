// Simple geocoding service using OpenStreetMap Nominatim API
// This is free and doesn't require an API key

export interface GeocodingResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  display_name: string;
}

export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WeatherWise-2.0/1.0 (https://github.com/your-repo/weatherwise)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        name: result.name || result.display_name.split(',')[0],
        country: result.address?.country || 'Unknown',
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
}

// Get location from coordinates (reverse geocoding)
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WeatherWise-2.0/1.0 (https://github.com/your-repo/weatherwise)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data) {
      return {
        name: data.name || data.display_name.split(',')[0],
        country: data.address?.country || 'Unknown',
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        display_name: data.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding location:', error);
    return null;
  }
} 