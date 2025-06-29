import Image from 'next/image';
import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Settings, Siren, Search, Sun, Moon } from 'lucide-react';

export default function Header({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSOSClick,
  onThemeToggle,
  theme,
  language,
  onLanguageChange,
  onAboutClick
}: {
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSOSClick: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
  language: string;
  onLanguageChange: (lang: string) => void;
  onAboutClick: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 shadow-md backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-row items-center justify-between py-3 px-4 gap-4">
        {/* Left: Logo + App Name */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <Image src="/logo.ico" alt="Logo" width={40} height={40} className="rounded" />
          <span className="text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-300">Weatherwise 2.0</span>
        </div>
        {/* Right: Search Bar + Settings (vertical stack) */}
        <div className="flex flex-col items-end gap-2 flex-1">
          {/* Search Bar */}
          <form onSubmit={onSearchSubmit} className="flex w-full max-w-xl justify-end">
            <Input
              type="text"
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Enter city name or coordinates (lat,lon)"
              className="rounded-l-full border-r-0 focus:ring-2 focus:ring-blue-400"
            />
            <Button type="submit" className="rounded-r-full bg-blue-600 hover:bg-blue-700 text-white px-4">
              <Search className="h-5 w-5" />
            </Button>
          </form>
          {/* Settings Gear + Dropdown */}
          <div className="flex items-center gap-4 mt-1">
            <Button
              type="button"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg h-12 w-12 flex items-center justify-center animate-pulse hover:animate-none"
              onClick={onSOSClick}
              aria-label="Emergency SOS"
            >
              <Siren className="h-7 w-7" />
            </Button>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full p-2"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-label="Settings"
              >
                <Settings className="h-7 w-7" />
              </Button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Language</div>
                  <div className="flex gap-2 px-4 pb-2">
                    <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => onLanguageChange('en')}>English</Button>
                    <Button variant={language === 'hi' ? 'default' : 'outline'} size="sm" onClick={() => onLanguageChange('hi')}>हिन्दी</Button>
                    <Button variant={language === 'mr' ? 'default' : 'outline'} size="sm" onClick={() => onLanguageChange('mr')}>मराठी</Button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={onThemeToggle}
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} Switch Theme
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={onAboutClick}
                  >
                    About Us
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 