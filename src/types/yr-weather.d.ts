// Yr.no (MET Norway) Weather API Types
// Based on: https://api.met.no/weatherapi/locationforecast/2.0/documentation

export interface YrWeatherCondition {
  symbol_code: string;
  symbol_confidence: string;
}

export interface YrWeatherDetails {
  air_pressure_at_sea_level?: number;
  air_temperature?: number;
  air_temperature_percentile_10?: number;
  air_temperature_percentile_90?: number;
  cloud_area_fraction?: number;
  cloud_area_fraction_high?: number;
  cloud_area_fraction_low?: number;
  cloud_area_fraction_medium?: number;
  dew_point_temperature?: number;
  fog_area_fraction?: number;
  relative_humidity?: number;
  ultraviolet_index_clear_sky?: number;
  wind_from_direction?: number;
  wind_speed?: number;
  wind_speed_of_gust?: number;
  wind_speed_percentile_10?: number;
  wind_speed_percentile_90?: number;
  precipitation_amount?: number;
  precipitation_amount_max?: number;
  precipitation_amount_min?: number;
  probability_of_precipitation?: number;
  probability_of_thunder?: number;
}

export interface YrWeatherInstant {
  details: YrWeatherDetails;
}

export interface YrWeatherSummary {
  symbol_code: string;
  symbol_confidence: string;
}

export interface YrWeatherNext1Hours {
  summary: YrWeatherSummary;
  details: {
    precipitation_amount?: number;
    precipitation_amount_max?: number;
    precipitation_amount_min?: number;
    probability_of_precipitation?: number;
    probability_of_thunder?: number;
  };
}

export interface YrWeatherNext6Hours {
  summary: YrWeatherSummary;
  details: {
    air_temperature_max?: number;
    air_temperature_min?: number;
    precipitation_amount?: number;
    precipitation_amount_max?: number;
    precipitation_amount_min?: number;
    probability_of_precipitation?: number;
  };
}

export interface YrWeatherNext12Hours {
  summary: YrWeatherSummary;
  details: {
    probability_of_precipitation?: number;
  };
}

export interface YrWeatherData {
  instant: YrWeatherInstant;
  next_1_hours?: YrWeatherNext1Hours;
  next_6_hours?: YrWeatherNext6Hours;
  next_12_hours?: YrWeatherNext12Hours;
}

export interface YrWeatherTimeSeries {
  time: string;
  data: YrWeatherData;
}

export interface YrWeatherMeta {
  updated_at: string;
  units: {
    air_pressure_at_sea_level: string;
    air_temperature: string;
    cloud_area_fraction: string;
    dew_point_temperature: string;
    fog_area_fraction: string;
    precipitation_amount: string;
    relative_humidity: string;
    ultraviolet_index_clear_sky: string;
    wind_from_direction: string;
    wind_speed: string;
  };
}

export interface YrWeatherProperties {
  meta: YrWeatherMeta;
  timeseries: YrWeatherTimeSeries[];
}

export interface YrWeatherGeometry {
  type: string;
  coordinates: [number, number, number];
}

export interface YrWeatherFeature {
  type: string;
  geometry: YrWeatherGeometry;
  properties: YrWeatherProperties;
}

export interface YrWeatherResponse {
  type: string;
  geometry: YrWeatherGeometry;
  properties: YrWeatherProperties;
}

// Location types for geocoding
export interface YrLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

// Converted types for compatibility with existing components
export interface ConvertedWeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface ConvertedCurrentWeather {
  last_updated_epoch: number;
  last_updated: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: ConvertedWeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
}

export interface ConvertedLocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface ConvertedDayForecast {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_mph: number;
  maxwind_kph: number;
  totalprecip_mm: number;
  totalprecip_in: number;
  totalsnow_cm: number;
  avgvis_km: number;
  avgvis_miles: number;
  avghumidity: number;
  daily_will_it_rain: number;
  daily_chance_of_rain: number;
  daily_will_it_snow: number;
  daily_chance_of_snow: number;
  condition: ConvertedWeatherCondition;
  uv: number;
}

export interface ConvertedAstro {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: string;
}

export interface ConvertedHourForecast {
  time_epoch: number;
  time: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: ConvertedWeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  windchill_c: number;
  windchill_f: number;
  heatindex_c: number;
  heatindex_f: number;
  dewpoint_c: number;
  dewpoint_f: number;
  will_it_rain: number;
  chance_of_rain: number;
  will_it_snow: number;
  chance_of_snow: number;
  vis_km: number;
  vis_miles: number;
  gust_mph: number;
  gust_kph: number;
  uv: number;
}

export interface ConvertedForecastDay {
  date: string;
  date_epoch: number;
  day: ConvertedDayForecast;
  astro: ConvertedAstro;
  hour: ConvertedHourForecast[];
}

export interface ConvertedForecast {
  forecastday: ConvertedForecastDay[];
}

export interface ConvertedWeatherAPIResponse {
  location: ConvertedLocation;
  current: ConvertedCurrentWeather;
  forecast: ConvertedForecast;
}
