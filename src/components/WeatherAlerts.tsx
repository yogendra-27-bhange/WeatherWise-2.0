"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, CloudRain, Thermometer, Wind, Sun, Snowflake, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WeatherAlert {
  id: string;
  type: 'storm' | 'heat' | 'cold' | 'rain' | 'wind' | 'fog' | 'snow' | 'lightning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  active: boolean;
}

interface WeatherAlertsProps {
  latitude?: number | null;
  longitude?: number | null;
  weatherData?: any;
}

const alertIcons = {
  storm: CloudRain,
  heat: Thermometer,
  cold: Snowflake,
  rain: CloudRain,
  wind: Wind,
  fog: Eye,
  snow: Snowflake,
  lightning: Zap
};

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300'
};

export function WeatherAlerts({ latitude, longitude, weatherData }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock alerts data - in real app, this would come from weather API
  useEffect(() => {
    if (weatherData) {
      const mockAlerts: WeatherAlert[] = [
        {
          id: '1',
          type: 'rain',
          severity: 'medium',
          title: 'Heavy Rainfall Warning',
          description: 'Heavy rainfall expected in the next 2 hours. Possible flooding in low-lying areas.',
          startTime: new Date(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          location: 'Your Area',
          active: true
        },
        {
          id: '2',
          type: 'wind',
          severity: 'high',
          title: 'Strong Wind Advisory',
          description: 'Wind speeds up to 40 km/h expected. Secure loose objects outdoors.',
          startTime: new Date(),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          location: 'Your Area',
          active: true
        }
      ];
      setAlerts(mockAlerts);
    }
  }, [weatherData]);

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In real app, request notification permissions here
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="shadow-lg bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-600" />
            Weather Alerts
          </CardTitle>
          <CardDescription>No active weather alerts in your area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
            <Label htmlFor="notifications">Enable weather notifications</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-white dark:bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle>Weather Alerts</CardTitle>
            <Badge variant="destructive" className="ml-2">
              {alerts.length} Active
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
            <Label htmlFor="notifications" className="text-sm">Notifications</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const IconComponent = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 ${severityColors[alert.severity]} relative`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <IconComponent className="h-6 w-6 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Location: {alert.location}</span>
                      <span>Until: {alert.endTime.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
} 