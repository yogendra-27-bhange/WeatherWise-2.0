"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BatteryWarning, ZapOff } from 'lucide-react';
import type { WeatherAPIResponse } from '@/types/weather';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface BatterySaverAlertProps {
  weatherData: WeatherAPIResponse | null;
}

const LOW_BATTERY_THRESHOLD = 0.20; // 20%
const BAD_WEATHER_KEYWORDS = ['storm', 'thunder', 'blizzard', 'heavy rain', 'warning', 'hurricane', 'cyclone', 'tornado'];

export function BatterySaverAlert({ weatherData }: BatterySaverAlertProps) {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (nav.getBattery) {
      nav.getBattery().then((battery) => {
        setBatteryLevel(battery.level);
        setIsCharging(battery.charging);

        battery.onlevelchange = () => setBatteryLevel(battery.level);
        battery.onchargingchange = () => setIsCharging(battery.charging);
      });
    }
  }, []);

  useEffect(() => {
    if (batteryLevel === null || isCharging === null || !weatherData?.current?.condition?.text) {
      setShowAlert(false);
      return;
    }

    const isBadWeather = BAD_WEATHER_KEYWORDS.some(keyword =>
      weatherData.current.condition.text.toLowerCase().includes(keyword) ||
      (weatherData.forecast.forecastday[0]?.day.condition.text.toLowerCase().includes(keyword))
    );
    
    const isBatteryLow = batteryLevel < LOW_BATTERY_THRESHOLD && !isCharging;

    setShowAlert(isBatteryLow && isBadWeather);

  }, [batteryLevel, isCharging, weatherData]);

  if (!showAlert) {
    return null;
  }

  return (
    <Alert variant="destructive" className="my-4 animate-pulse">
      <BatteryWarning className="h-5 w-5" />
      <AlertTitle>Low Battery & Potential Bad Weather!</AlertTitle>
      <AlertDescription>
        Your battery is at {batteryLevel !== null ? Math.round(batteryLevel * 100) : 'N/A'}%.
        With potentially severe weather approaching (current: {weatherData?.current.condition.text}), please conserve power or charge your device.
      </AlertDescription>
    </Alert>
  );
}
