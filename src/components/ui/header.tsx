import Image from 'next/image';
import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Settings, Siren, Search, Sun, Moon } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';

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
    <header className="w-full bg-blue-50 dark:bg-blue-900 shadow-md border-b border-blue-200 dark:border-blue-800 backdrop-blur sticky top-0 z-40">
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
          {/* Settings Gear + Modal */}
          <div className="flex items-center gap-4 mt-1">
            <Button
              type="button"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl h-14 w-14 flex items-center justify-center animate-pulse hover:animate-none text-lg font-bold border-4 border-red-700"
              onClick={onSOSClick}
              aria-label="Emergency SOS"
            >
              <Siren className="h-8 w-8" />
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full p-2"
                  aria-label="Settings"
                >
                  <Settings className="h-7 w-7" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>Personalize your Weatherwise experience.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <div className="font-semibold mb-1">Language</div>
                  <div className="flex gap-2 mb-4">
                    <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => onLanguageChange('en')}>English</Button>
                    <Button variant={language === 'hi' ? 'default' : 'outline'} size="sm" onClick={() => onLanguageChange('hi')}>हिन्दी</Button>
                    <Button variant={language === 'mr' ? 'default' : 'outline'} size="sm" onClick={() => onLanguageChange('mr')}>मराठी</Button>
                  </div>
                  <div className="font-semibold mb-1">Theme</div>
                  <Button onClick={onThemeToggle} className="mb-4">
                    {theme === 'light' ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />} Switch Theme
                  </Button>
                  <div className="font-semibold mb-1">About</div>
                  <Button onClick={onAboutClick} variant="outline">About Us</Button>
                  <div className="mt-6 text-xs text-muted-foreground">More settings coming soon...</div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
} 