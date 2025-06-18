
export interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    mapbox_id?: string;
    wikidata?: string;
    foursquare?: string;
    landmark?: boolean;
    address?: string;
    category?: string;
    maki?: string;
    [key: string]: any; 
  };
  text: string;
  place_name: string;
  bbox?: [number, number, number, number];
  center: [number, number]; // longitude, latitude
  geometry: {
    type: string;
    coordinates: [number, number]; // longitude, latitude
    interpolated?: boolean;
    omitted?: boolean;
  };
  context?: Array<{
    id: string;
    mapbox_id: string;
    wikidata?: string;
    text: string;
    short_code?: string;
  }>;
  [key: string]: any;
}

export interface MapboxGeocodingResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

export interface Place {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'hospital' | 'police' | 'shelter'; 
  address?: string;
}
