# WeatherWise 2.0

**Live Demo:** [https://weatherwise2-0.netlify.app/](https://weatherwise2-0.netlify.app/)

## Recent Updates
- **Mapbox removed:** All Mapbox and API key dependencies for maps and POI are removed.
- **OpenStreetMap + Leaflet:** The app now uses OpenStreetMap and Leaflet for all map and location features—no API key required.
- **Nearby Facilities:** Points of interest (hospitals, police, shelters) are fetched using the free OpenStreetMap Overpass API.

Your intelligent weather companion powered by **MET Norway (Yr.no)** - the Norwegian Meteorological Institute's free weather API.

## ✨ Features

- **Real-time Weather Data**: Powered by MET Norway's Yr.no API (free, no API key required)
- **Smart Day Planning**: AI-powered recommendations based on weather conditions
- **Weather Stories**: Engaging narratives about your local weather
- **Music Recommendations**: Weather-appropriate music suggestions
- **Clothing & Food Suggestions**: Personalized recommendations
- **Medical Tips**: Health advice based on weather conditions
- **Emergency Features**: Safety alerts and emergency contact integration
- **Offline Survival Kit**: Essential weather information available offline
- **Air Quality Alerts**: Real-time air quality monitoring
- **Interactive Maps**: OpenStreetMap integration with weather overlays
- **Dark Mode**: Beautiful dark/light theme switching
- **Mobile Responsive**: Optimized for all devices

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd WeatherWise-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌍 Weather Data Source

This application uses the **MET Norway (Yr.no) API**, which provides:
- Free weather data with no API key required
- High-quality meteorological data from the Norwegian Meteorological Institute
- Global coverage with detailed forecasts
- Reliable and accurate weather information

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Weather API**: MET Norway (Yr.no) - Free, no API key required
- **Geocoding**: OpenStreetMap Nominatim API
- **AI Features**: Google AI (Genkit) for weather summaries and recommendations
- **Maps**: OpenStreetMap with Leaflet
- **Charts**: Chart.js and Recharts
- **Icons**: Lucide React

## 📱 Features in Detail

### Weather Information
- Current conditions with detailed metrics
- 3-day forecast with hourly breakdowns
- Temperature, humidity, wind, pressure, UV index
- Weather condition icons and descriptions

### Smart Features
- **AI Weather Summary**: Conversational weather summaries
- **Day Planner**: Personalized activity recommendations
- **Weather Stories**: Engaging narratives about local weather
- **Music Recommendations**: Weather-appropriate music suggestions

### Safety & Health
- **Emergency Button**: Quick access to emergency services
- **Medical Tips**: Health advice based on weather conditions
- **Air Quality Monitoring**: Real-time air quality alerts
- **Battery Saver Alerts**: Low battery warnings during bad weather

### Location Services
- **GPS Integration**: Automatic location detection
- **Manual Location Entry**: Search by city name or coordinates
- **Reverse Geocoding**: Get location names from coordinates
- **Interactive Maps**: Visual weather and location data

## 🔧 Configuration

### Environment Variables
No API keys required! The application uses free services:
- Yr.no API (weather data) - No key needed
- OpenStreetMap Nominatim (geocoding) - No key needed

### Optional AI Features
For AI-powered features (weather summaries, day planning), you can optionally configure:
```env
GOOGLE_AI_API_KEY=your_google_ai_key
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── lib/                # Utility functions and services
│   ├── yr-weather-service.ts    # Yr.no API integration
│   ├── geocoding-service.ts     # Location services
│   └── ...             # Other utilities
├── types/              # TypeScript type definitions
│   ├── yr-weather.d.ts # Yr.no API types
│   └── ...             # Other type definitions
├── ai/                 # AI features (Genkit)
│   └── flows/          # AI workflows
└── hooks/              # Custom React hooks
```

## 🌟 Key Components

### Weather Service (`src/lib/yr-weather-service.ts`)
- Handles Yr.no API calls
- Converts Yr.no data to compatible format
- Manages weather symbol mapping
- Provides temperature and unit conversions

### Geocoding Service (`src/lib/geocoding-service.ts`)
- Location name to coordinates conversion
- Reverse geocoding (coordinates to location name)
- Uses OpenStreetMap Nominatim API

### Weather Display (`src/components/WeatherDisplay.tsx`)
- Main weather information display
- Current conditions and forecast
- Responsive design with beautiful UI

## 🎨 UI/UX Features

- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Dark Mode**: Toggle between light and dark themes
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant design

## 🔮 Future Features

- Multi-language support (English, Hindi, Marathi)
- Weather-based reminder system
- Live weather camera integration
- Route safety checker
- Hospital queue wait-time estimator
- AI weather chatbot
- User safety status sharing
- Volunteer help coordination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **MET Norway (Yr.no)**: For providing free, high-quality weather data
- **OpenStreetMap**: For free geocoding and mapping services
- **shadcn/ui**: For beautiful, accessible UI components
- **Next.js Team**: For the amazing React framework

---

**WeatherWise 2.0** - Making weather information accessible, intelligent, and beautiful! 🌤️

