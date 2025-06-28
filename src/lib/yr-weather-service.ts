import type { 
  YrWeatherResponse, 
  YrLocation, 
  ConvertedWeatherAPIResponse,
  ConvertedCurrentWeather,
  ConvertedLocation,
  ConvertedForecast,
  ConvertedForecastDay,
  ConvertedDayForecast,
  ConvertedHourForecast,
  ConvertedWeatherCondition,
  ConvertedAstro
} from '@/types/yr-weather';

// Yr.no API base URL
const YR_API_BASE = 'https://api.met.no/weatherapi/locationforecast/2.0';

// Weather symbol mapping for Yr.no to readable text and icons
const WEATHER_SYMBOL_MAP: Record<string, { text: string; icon: string; code: number }> = {
  'clearsky_day': { text: 'Clear Sky', icon: '113', code: 1000 },
  'clearsky_night': { text: 'Clear Sky', icon: '113', code: 1000 },
  'clearsky_polartwilight': { text: 'Clear Sky', icon: '113', code: 1000 },
  'fair_day': { text: 'Partly Cloudy', icon: '116', code: 1003 },
  'fair_night': { text: 'Partly Cloudy', icon: '116', code: 1003 },
  'fair_polartwilight': { text: 'Partly Cloudy', icon: '116', code: 1003 },
  'partlycloudy_day': { text: 'Partly Cloudy', icon: '116', code: 1003 },
  'partlycloudy_night': { text: 'Partly Cloudy', icon: '116', code: 1003 },
  'partlycloudy_polartwilight': { text: 'Partly Cloudy', icon: '116', code: 1003 },
  'cloudy': { text: 'Cloudy', icon: '119', code: 1006 },
  'fog': { text: 'Fog', icon: '248', code: 1030 },
  'fog_day': { text: 'Fog', icon: '248', code: 1030 },
  'fog_night': { text: 'Fog', icon: '248', code: 1030 },
  'fog_polartwilight': { text: 'Fog', icon: '248', code: 1030 },
  'lightrain': { text: 'Light Rain', icon: '296', code: 1063 },
  'lightrain_day': { text: 'Light Rain', icon: '296', code: 1063 },
  'lightrain_night': { text: 'Light Rain', icon: '296', code: 1063 },
  'lightrain_polartwilight': { text: 'Light Rain', icon: '296', code: 1063 },
  'rain': { text: 'Rain', icon: '302', code: 1066 },
  'rain_day': { text: 'Rain', icon: '302', code: 1066 },
  'rain_night': { text: 'Rain', icon: '302', code: 1066 },
  'rain_polartwilight': { text: 'Rain', icon: '302', code: 1066 },
  'heavyrain': { text: 'Heavy Rain', icon: '308', code: 1195 },
  'heavyrain_day': { text: 'Heavy Rain', icon: '308', code: 1195 },
  'heavyrain_night': { text: 'Heavy Rain', icon: '308', code: 1195 },
  'heavyrain_polartwilight': { text: 'Heavy Rain', icon: '308', code: 1195 },
  'sleet': { text: 'Sleet', icon: '320', code: 1069 },
  'sleet_day': { text: 'Sleet', icon: '320', code: 1069 },
  'sleet_night': { text: 'Sleet', icon: '320', code: 1069 },
  'sleet_polartwilight': { text: 'Sleet', icon: '320', code: 1069 },
  'lightsnow': { text: 'Light Snow', icon: '326', code: 1066 },
  'lightsnow_day': { text: 'Light Snow', icon: '326', code: 1066 },
  'lightsnow_night': { text: 'Light Snow', icon: '326', code: 1066 },
  'lightsnow_polartwilight': { text: 'Light Snow', icon: '326', code: 1066 },
  'snow': { text: 'Snow', icon: '332', code: 1066 },
  'snow_day': { text: 'Snow', icon: '332', code: 1066 },
  'snow_night': { text: 'Snow', icon: '332', code: 1066 },
  'snow_polartwilight': { text: 'Snow', icon: '332', code: 1066 },
  'heavysnow': { text: 'Heavy Snow', icon: '338', code: 1117 },
  'heavysnow_day': { text: 'Heavy Snow', icon: '338', code: 1117 },
  'heavysnow_night': { text: 'Heavy Snow', icon: '338', code: 1117 },
  'heavysnow_polartwilight': { text: 'Heavy Snow', icon: '338', code: 1117 },
  'lightrainshowers_day': { text: 'Light Rain Showers', icon: '353', code: 1063 },
  'rainshowers_day': { text: 'Rain Showers', icon: '356', code: 1066 },
  'heavyrainshowers_day': { text: 'Heavy Rain Showers', icon: '359', code: 1195 },
  'lightrainshowers_night': { text: 'Light Rain Showers', icon: '353', code: 1063 },
  'rainshowers_night': { text: 'Rain Showers', icon: '356', code: 1066 },
  'heavyrainshowers_night': { text: 'Heavy Rain Showers', icon: '359', code: 1195 },
  'lightsnowshowers_day': { text: 'Light Snow Showers', icon: '362', code: 1066 },
  'snowshowers_day': { text: 'Snow Showers', icon: '365', code: 1066 },
  'heavysnowshowers_day': { text: 'Heavy Snow Showers', icon: '368', code: 1117 },
  'lightsnowshowers_night': { text: 'Light Snow Showers', icon: '362', code: 1066 },
  'snowshowers_night': { text: 'Snow Showers', icon: '365', code: 1066 },
  'heavysnowshowers_night': { text: 'Heavy Snow Showers', icon: '368', code: 1117 },
  'lightrain_thunder': { text: 'Light Rain with Thunder', icon: '200', code: 1087 },
  'rain_thunder': { text: 'Rain with Thunder', icon: '200', code: 1087 },
  'heavyrain_thunder': { text: 'Heavy Rain with Thunder', icon: '200', code: 1087 },
  'lightrainshowers_day_thunder': { text: 'Light Rain Showers with Thunder', icon: '200', code: 1087 },
  'rainshowers_day_thunder': { text: 'Rain Showers with Thunder', icon: '200', code: 1087 },
  'heavyrainshowers_day_thunder': { text: 'Heavy Rain Showers with Thunder', icon: '200', code: 1087 },
  'lightrainshowers_night_thunder': { text: 'Light Rain Showers with Thunder', icon: '200', code: 1087 },
  'rainshowers_night_thunder': { text: 'Rain Showers with Thunder', icon: '200', code: 1087 },
  'heavyrainshowers_night_thunder': { text: 'Heavy Rain Showers with Thunder', icon: '200', code: 1087 },
  'lightsnowshowers_day_thunder': { text: 'Light Snow Showers with Thunder', icon: '200', code: 1087 },
  'snowshowers_day_thunder': { text: 'Snow Showers with Thunder', icon: '200', code: 1087 },
  'heavysnowshowers_day_thunder': { text: 'Heavy Snow Showers with Thunder', icon: '200', code: 1087 },
  'lightsnowshowers_night_thunder': { text: 'Light Snow Showers with Thunder', icon: '200', code: 1087 },
  'snowshowers_night_thunder': { text: 'Snow Showers with Thunder', icon: '200', code: 1087 },
  'heavysnowshowers_night_thunder': { text: 'Heavy Snow Showers with Thunder', icon: '200', code: 1087 },
};

// Helper function to convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5) + 32);
};

// Helper function to convert km/h to mph
const kmhToMph = (kmh: number): number => {
  return Math.round(kmh * 0.621371);
};

// Helper function to convert mb to inHg
const mbToInHg = (mb: number): number => {
  return Math.round(mb * 0.02953 * 100) / 100;
};

// Helper function to convert mm to inches
const mmToInches = (mm: number): number => {
  return Math.round(mm * 0.0393701 * 100) / 100;
};

// Helper function to get wind direction from degrees
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Helper function to get weather condition from symbol code
const getWeatherCondition = (symbolCode: string): ConvertedWeatherCondition => {
  const mapped = WEATHER_SYMBOL_MAP[symbolCode];
  if (mapped) {
    return {
      text: mapped.text,
      icon: `//cdn.weatherapi.com/weather/64x64/day/${mapped.icon}.png`,
      code: mapped.code
    };
  }
  
  // Default fallback
  return {
    text: 'Unknown',
    icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
    code: 1000
  };
};

// Helper function to check if it's day time
const isDayTime = (time: string): number => {
  const hour = new Date(time).getHours();
  return hour >= 6 && hour <= 18 ? 1 : 0;
};

// Helper function to calculate feels like temperature
const calculateFeelsLike = (temp: number, humidity: number, windSpeed: number): number => {
  // Simple wind chill calculation
  if (temp <= 10 && windSpeed > 4.8) {
    return Math.round(13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16));
  }
  return temp;
};

// Fetch weather data from Yr.no API
export async function fetchYrWeather(lat: number, lon: number): Promise<YrWeatherResponse> {
  const url = `${YR_API_BASE}/compact?lat=${lat}&lon=${lon}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WeatherWise-2.0/1.0 (https://github.com/your-repo/weatherwise)',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Yr.no API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Convert Yr.no data to compatible format
export function convertYrWeatherData(
  yrData: YrWeatherResponse, 
  locationName: string = 'Unknown Location',
  country: string = 'Unknown'
): ConvertedWeatherAPIResponse {
  const timeseries = yrData.properties.timeseries;
  const current = timeseries[0];
  
  if (!current) {
    throw new Error('No weather data available');
  }

  const currentDetails = current.data.instant.details;
  const currentTime = new Date(current.time);
  
  // Convert current weather
  const convertedCurrent: ConvertedCurrentWeather = {
    last_updated_epoch: Math.floor(currentTime.getTime() / 1000),
    last_updated: currentTime.toISOString(),
    temp_c: currentDetails.air_temperature || 0,
    temp_f: celsiusToFahrenheit(currentDetails.air_temperature || 0),
    is_day: isDayTime(current.time),
    condition: getWeatherCondition(current.data.next_1_hours?.summary.symbol_code || 'clearsky_day'),
    wind_mph: kmhToMph(currentDetails.wind_speed || 0),
    wind_kph: currentDetails.wind_speed || 0,
    wind_degree: currentDetails.wind_from_direction || 0,
    wind_dir: getWindDirection(currentDetails.wind_from_direction || 0),
    pressure_mb: currentDetails.air_pressure_at_sea_level || 0,
    pressure_in: mbToInHg(currentDetails.air_pressure_at_sea_level || 0),
    precip_mm: current.data.next_1_hours?.details.precipitation_amount || 0,
    precip_in: mmToInches(current.data.next_1_hours?.details.precipitation_amount || 0),
    humidity: currentDetails.relative_humidity || 0,
    cloud: currentDetails.cloud_area_fraction || 0,
    feelslike_c: calculateFeelsLike(
      currentDetails.air_temperature || 0,
      currentDetails.relative_humidity || 0,
      currentDetails.wind_speed || 0
    ),
    feelslike_f: celsiusToFahrenheit(calculateFeelsLike(
      currentDetails.air_temperature || 0,
      currentDetails.relative_humidity || 0,
      currentDetails.wind_speed || 0
    )),
    vis_km: 10, // Yr.no doesn't provide visibility, using default
    vis_miles: 6,
    uv: currentDetails.ultraviolet_index_clear_sky || 0,
    gust_mph: kmhToMph(currentDetails.wind_speed_of_gust || 0),
    gust_kph: currentDetails.wind_speed_of_gust || 0
  };

  // Convert location
  const convertedLocation: ConvertedLocation = {
    name: locationName,
    region: '',
    country: country,
    lat: yrData.geometry.coordinates[1],
    lon: yrData.geometry.coordinates[0],
    tz_id: 'Europe/Oslo', // Default timezone, can be improved
    localtime_epoch: Math.floor(currentTime.getTime() / 1000),
    localtime: currentTime.toISOString()
  };

  // Group timeseries by day for forecast
  const dailyData = new Map<string, any[]>();
  
  timeseries.forEach(item => {
    const date = new Date(item.time).toISOString().split('T')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, []);
    }
    dailyData.get(date)!.push(item);
  });

  // Convert forecast data
  const forecastDays: ConvertedForecastDay[] = [];
  const sortedDates = Array.from(dailyData.keys()).sort().slice(0, 3);

  sortedDates.forEach(date => {
    const dayData = dailyData.get(date)!;
    
    // Calculate day statistics
    const temperatures = dayData
      .map(item => item.data.instant.details.air_temperature)
      .filter(temp => temp !== undefined);
    
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    
    // Get precipitation data
    const precipitation = dayData
      .map(item => item.data.next_1_hours?.details.precipitation_amount || 0)
      .reduce((a, b) => a + b, 0);
    
    // Get most common weather condition for the day
    const conditions = dayData
      .map(item => item.data.next_1_hours?.summary.symbol_code || 'clearsky_day')
      .filter(Boolean);
    
    const mostCommonCondition = conditions.length > 0 
      ? conditions.sort((a, b) => 
          conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
        ).pop()! 
      : 'clearsky_day';

    const convertedDay: ConvertedDayForecast = {
      maxtemp_c: maxTemp,
      maxtemp_f: celsiusToFahrenheit(maxTemp),
      mintemp_c: minTemp,
      mintemp_f: celsiusToFahrenheit(minTemp),
      avgtemp_c: avgTemp,
      avgtemp_f: celsiusToFahrenheit(avgTemp),
      maxwind_mph: kmhToMph(Math.max(...dayData.map(item => item.data.instant.details.wind_speed || 0))),
      maxwind_kph: Math.max(...dayData.map(item => item.data.instant.details.wind_speed || 0)),
      totalprecip_mm: precipitation,
      totalprecip_in: mmToInches(precipitation),
      totalsnow_cm: 0, // Yr.no doesn't separate snow, using 0
      avgvis_km: 10,
      avgvis_miles: 6,
      avghumidity: dayData.reduce((sum, item) => sum + (item.data.instant.details.relative_humidity || 0), 0) / dayData.length,
      daily_will_it_rain: precipitation > 0 ? 1 : 0,
      daily_chance_of_rain: Math.max(...dayData.map(item => item.data.next_1_hours?.details.probability_of_precipitation || 0)),
      daily_will_it_snow: 0,
      daily_chance_of_snow: 0,
      condition: getWeatherCondition(mostCommonCondition),
      uv: Math.max(...dayData.map(item => item.data.instant.details.ultraviolet_index_clear_sky || 0))
    };

    // Convert hourly data
    const hourlyData: ConvertedHourForecast[] = dayData.slice(0, 24).map(item => {
      const details = item.data.instant.details;
      const next1Hour = item.data.next_1_hours;
      
      return {
        time_epoch: Math.floor(new Date(item.time).getTime() / 1000),
        time: item.time,
        temp_c: details.air_temperature || 0,
        temp_f: celsiusToFahrenheit(details.air_temperature || 0),
        is_day: isDayTime(item.time),
        condition: getWeatherCondition(next1Hour?.summary.symbol_code || 'clearsky_day'),
        wind_mph: kmhToMph(details.wind_speed || 0),
        wind_kph: details.wind_speed || 0,
        wind_degree: details.wind_from_direction || 0,
        wind_dir: getWindDirection(details.wind_from_direction || 0),
        pressure_mb: details.air_pressure_at_sea_level || 0,
        pressure_in: mbToInHg(details.air_pressure_at_sea_level || 0),
        precip_mm: next1Hour?.details.precipitation_amount || 0,
        precip_in: mmToInches(next1Hour?.details.precipitation_amount || 0),
        humidity: details.relative_humidity || 0,
        cloud: details.cloud_area_fraction || 0,
        feelslike_c: calculateFeelsLike(
          details.air_temperature || 0,
          details.relative_humidity || 0,
          details.wind_speed || 0
        ),
        feelslike_f: celsiusToFahrenheit(calculateFeelsLike(
          details.air_temperature || 0,
          details.relative_humidity || 0,
          details.wind_speed || 0
        )),
        windchill_c: details.air_temperature || 0,
        windchill_f: celsiusToFahrenheit(details.air_temperature || 0),
        heatindex_c: details.air_temperature || 0,
        heatindex_f: celsiusToFahrenheit(details.air_temperature || 0),
        dewpoint_c: details.dew_point_temperature || 0,
        dewpoint_f: celsiusToFahrenheit(details.dew_point_temperature || 0),
        will_it_rain: (next1Hour?.details.precipitation_amount || 0) > 0 ? 1 : 0,
        chance_of_rain: next1Hour?.details.probability_of_precipitation || 0,
        will_it_snow: 0,
        chance_of_snow: 0,
        vis_km: 10,
        vis_miles: 6,
        gust_mph: kmhToMph(details.wind_speed_of_gust || 0),
        gust_kph: details.wind_speed_of_gust || 0,
        uv: details.ultraviolet_index_clear_sky || 0
      };
    });

    // Mock astro data (Yr.no doesn't provide this)
    const astro: ConvertedAstro = {
      sunrise: '06:00 AM',
      sunset: '06:00 PM',
      moonrise: '12:00 PM',
      moonset: '12:00 AM',
      moon_phase: 'Waxing Crescent',
      moon_illumination: '50'
    };

    forecastDays.push({
      date: date,
      date_epoch: Math.floor(new Date(date).getTime() / 1000),
      day: convertedDay,
      astro: astro,
      hour: hourlyData
    });
  });

  const convertedForecast: ConvertedForecast = {
    forecastday: forecastDays
  };

  return {
    location: convertedLocation,
    current: convertedCurrent,
    forecast: convertedForecast
  };
}

// Main function to get weather data
export async function getYrWeather(lat: number, lon: number, locationName?: string, country?: string): Promise<ConvertedWeatherAPIResponse> {
  try {
    const yrData = await fetchYrWeather(lat, lon);
    return convertYrWeatherData(yrData, locationName, country);
  } catch (error) {
    console.error('Error fetching Yr.no weather data:', error);
    throw error;
  }
}
