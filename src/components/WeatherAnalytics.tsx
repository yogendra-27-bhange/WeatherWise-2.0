"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, CloudRain, Thermometer, Wind, Droplets, Calendar } from 'lucide-react';

interface WeatherAnalyticsProps {
  weatherData?: any;
  latitude?: number | null;
  longitude?: number | null;
}

// Mock data for analytics
const temperatureData = [
  { time: '00:00', temp: 18, feels: 16 },
  { time: '03:00', temp: 16, feels: 14 },
  { time: '06:00', temp: 15, feels: 13 },
  { time: '09:00', temp: 20, feels: 18 },
  { time: '12:00', temp: 25, feels: 23 },
  { time: '15:00', temp: 27, feels: 25 },
  { time: '18:00', temp: 24, feels: 22 },
  { time: '21:00', temp: 20, feels: 18 }
];

const rainfallData = [
  { day: 'Mon', rainfall: 0, chance: 10 },
  { day: 'Tue', rainfall: 5, chance: 30 },
  { day: 'Wed', rainfall: 15, chance: 80 },
  { day: 'Thu', rainfall: 8, chance: 60 },
  { day: 'Fri', rainfall: 2, chance: 20 },
  { day: 'Sat', rainfall: 0, chance: 5 },
  { day: 'Sun', rainfall: 0, chance: 10 }
];

const airQualityData = [
  { name: 'Good', value: 65, color: '#10B981' },
  { name: 'Moderate', value: 20, color: '#F59E0B' },
  { name: 'Poor', value: 10, color: '#EF4444' },
  { name: 'Very Poor', value: 5, color: '#7C3AED' }
];

const weeklyTrends = [
  { day: 'Mon', high: 28, low: 18, avg: 23 },
  { day: 'Tue', high: 30, low: 20, avg: 25 },
  { day: 'Wed', high: 32, low: 22, avg: 27 },
  { day: 'Thu', high: 31, low: 21, avg: 26 },
  { day: 'Fri', high: 29, low: 19, avg: 24 },
  { day: 'Sat', high: 27, low: 17, avg: 22 },
  { day: 'Sun', high: 26, low: 16, avg: 21 }
];

export function WeatherAnalytics({ weatherData, latitude, longitude }: WeatherAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('temperature');
  const [timeRange, setTimeRange] = useState('24h');

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { category: 'Good', color: '#10B981', description: 'Air quality is satisfactory' };
    if (aqi <= 100) return { category: 'Moderate', color: '#F59E0B', description: 'Some pollutants may be a concern' };
    if (aqi <= 150) return { category: 'Poor', color: '#EF4444', description: 'Health effects may be experienced' };
    return { category: 'Very Poor', color: '#7C3AED', description: 'Health warnings of emergency conditions' };
  };

  const currentAQI = 45; // Mock AQI value
  const aqiInfo = getAQICategory(currentAQI);

  return (
    <Card className="shadow-lg bg-white dark:bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle>Weather Analytics</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7d
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30d
            </Button>
          </div>
        </div>
        <CardDescription>Detailed weather analysis and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="temperature" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature
            </TabsTrigger>
            <TabsTrigger value="rainfall" className="flex items-center gap-2">
              <CloudRain className="h-4 w-4" />
              Rainfall
            </TabsTrigger>
            <TabsTrigger value="airquality" className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Air Quality
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                  <p className="text-2xl font-bold text-blue-600">{weatherData?.current?.temp_c || 25}°C</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Feels Like</p>
                  <p className="text-2xl font-bold text-green-600">{weatherData?.current?.feelslike_c || 23}°C</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
                  <p className="text-2xl font-bold text-purple-600">22°C</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="#3B82F6" strokeWidth={2} name="Temperature" />
                  <Line type="monotone" dataKey="feels" stroke="#10B981" strokeWidth={2} name="Feels Like" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="rainfall" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Rainfall</p>
                  <p className="text-2xl font-bold text-blue-600">5mm</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rain Chance</p>
                  <p className="text-2xl font-bold text-green-600">30%</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rainfallData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rainfall" fill="#3B82F6" name="Rainfall (mm)" />
                  <Bar dataKey="chance" fill="#10B981" name="Chance (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="airquality" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current AQI</p>
                  <p className="text-2xl font-bold" style={{ color: aqiInfo.color }}>
                    {currentAQI}
                  </p>
                </div>
                <Badge style={{ backgroundColor: aqiInfo.color, color: 'white' }}>
                  {aqiInfo.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{aqiInfo.description}</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={airQualityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {airQualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekly High</p>
                  <p className="text-2xl font-bold text-red-600">32°C</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Low</p>
                  <p className="text-2xl font-bold text-blue-600">16°C</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Avg</p>
                  <p className="text-2xl font-bold text-green-600">24°C</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="high" stroke="#EF4444" strokeWidth={2} name="High" />
                  <Line type="monotone" dataKey="low" stroke="#3B82F6" strokeWidth={2} name="Low" />
                  <Line type="monotone" dataKey="avg" stroke="#10B981" strokeWidth={2} name="Average" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 