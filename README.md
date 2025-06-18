
# Weatherwise 2.0

This is a Next.js application called Weatherwise 2.0, an intelligent weather companion.

## Features

- **Weather Display**: Shows current weather and forecast.
- **AI Weather Summary**: Provides a conversational summary of the current weather using Genkit.
- **Smart Day Planner**: AI-generated personalized advice for your day (e.g., "Carry an umbrella; rain expected at 4 PM").
- **AI Weather Stories**: Generates short, fun weather-themed stories, great for kids.
- **Mood-Based Music**: Recommends music from YouTube based on weather, using AI to refine search queries.
- **Clothing Suggestion**: Suggests appropriate attire.
- **Food Suggestion**: Recommends seasonal food and drinks.
- **Medical Tips**: Provides weather-relevant health advice.
- **Nearby Shelters**: Displays local hospitals, police stations, and shelters on a map using Leaflet.js and OpenStreetMap for map tiles. Points of interest are fetched using the Mapbox Geocoding API.
- **Emergency Button**: SOS button for quick emergency contact, including a QR code with basic info.
- **Battery Saver Alert**: Warns you to save power if your device battery is low and bad weather is approaching.
- **Air Quality Alerts**: Placeholder for displaying AQI and related health tips (requires AQI API integration).
- **Offline Survival Kit**: Basic emergency numbers and tips shown when offline.
- **Placeholders for Future Features**:
    - Weather-Based Reminder System
    - Live Weather Cam Integration
    - Multi-Language Support (English, Hindi, Marathi)
    - Route Safety Checker
    - "Mark Me Safe" Button (Firebase integration needed)
    - Nearby Volunteer Help (Firebase integration needed)
    - Hospital Queue Wait-Time Estimator (Firebase/dummy data needed)
    - AI Weather Bot

## Getting Started

First, install the dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

Next, set up your environment variables. Create a file named `.env.local` in the root of your project and add the following API keys:

```
NEXT_PUBLIC_WEATHER_API_KEY=your_weatherapi_com_key
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_data_api_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_for_poi_data
NEXT_PUBLIC_AQI_API_KEY=your_aqi_api_key (for Air Quality Index feature)
```

Replace `your_..._key` with your actual API keys from the respective services:
- [WeatherAPI.com](https://www.weatherapi.com/)
- [Google Cloud Console (for YouTube Data API)](https://console.cloud.google.com/)
- [Mapbox](https://www.mapbox.com/) (Access token is used for fetching Points of Interest, map tiles are from OpenStreetMap)
- An Air Quality Index (AQI) provider like [AQICN](https://aqicn.org/api/) or [OpenWeatherMap Air Pollution API](https://openweathermap.org/api/air-pollution).


Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) (or your configured port) with your browser to see the result.

The main application page is located at `src/app/page.tsx`.
AI flows are in `src/ai/flows/`.

