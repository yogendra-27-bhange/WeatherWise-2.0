import Image from 'next/image';
import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Settings, Siren, Search, Sun, Moon, User, Bell, ThermometerSun } from 'lucide-react';
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
    <header className="w-full sticky top-0 z-40 px-2 pt-2">
      <div className="glass-card max-w-6xl mx-auto flex items-center justify-between py-4 px-6 gap-6 shadow-xl">
        {/* Left: Logo + Title + Subtitle */}
        <div className="flex items-center gap-4 min-w-[220px]">
          <Image src="/logo.ico" alt="Logo" width={48} height={48} className="rounded-xl shadow-md" />
          <div className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Weatherwise 2.0</span>
            <span className="text-sm font-medium text-blue-100/90 -mt-1">Your Smart Weather Companion</span>
          </div>
        </div>
        {/* Center: Search Bar */}
        <form onSubmit={onSearchSubmit} className="flex-1 flex justify-center items-center max-w-xl">
          <div className="flex w-full glass-card bg-white/20 dark:bg-blue-900/40 p-1 shadow-inner">
            <Input
              type="text"
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Enter city name or coordinates (lat,lon)"
              className="rounded-l-full border-none bg-transparent text-white placeholder:text-blue-100/70 focus:ring-2 focus:ring-blue-400"
            />
            <Button type="submit" className="rounded-r-full bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-600 hover:to-indigo-500 text-white px-6 font-semibold shadow-md">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>
        {/* Right: Icon Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button type="button" variant="ghost" className="rounded-full p-2 text-white hover:bg-white/10" onClick={onThemeToggle} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </Button>
          {/* Units Toggle (placeholder icon) */}
          <Button type="button" variant="ghost" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Toggle Units">
            <ThermometerSun className="h-6 w-6" />
          </Button>
          {/* Alerts */}
          <Button type="button" variant="ghost" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Alerts">
            <Bell className="h-6 w-6" />
          </Button>
          {/* Settings */}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Settings">
                <Settings className="h-6 w-6" />
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
          {/* Profile */}
          <Button type="button" variant="ghost" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Profile">
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
} 