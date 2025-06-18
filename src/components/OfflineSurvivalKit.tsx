"use client";

import { useState, useEffect } from 'react';
import { SectionCard } from "./SectionCard";
import { WifiOff, ShieldAlert, PhoneCall, HelpCircle, ListChecks } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


export function OfflineSurvivalKit() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
        setIsOffline(!window.navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <SectionCard title="Offline Survival Kit" icon={WifiOff} className="border-destructive bg-destructive/10">
      <div className="space-y-4">
        <p className="text-sm text-destructive-foreground/80">You appear to be offline. Here's some basic information that might be helpful in an emergency:</p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="emergency-numbers">
            <AccordionTrigger className="text-base text-destructive-foreground hover:text-destructive-foreground/80">
                <PhoneCall className="mr-2 h-5 w-5" /> Emergency Numbers (Generic)
            </AccordionTrigger>
            <AccordionContent className="text-destructive-foreground/90">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Police: 100 or 112</li>
                <li>Fire: 101</li>
                <li>Ambulance: 102 or 108</li>
                <li>Disaster Management: 1070 (State) / 1077 (District)</li>
                <li>Women Helpline: 1091</li>
                <li>Child Helpline: 1098</li>
              </ul>
              <p className="mt-2 text-xs">Note: These are common emergency numbers in India. Verify local numbers if possible.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="basic-tips">
            <AccordionTrigger className="text-base text-destructive-foreground hover:text-destructive-foreground/80">
                <ListChecks className="mr-2 h-5 w-5" /> Basic Survival Tips
            </AccordionTrigger>
            <AccordionContent className="text-destructive-foreground/90">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Stay Calm: Panicking can make things worse. Try to think clearly.</li>
                <li>Find Shelter: Protect yourself from the elements.</li>
                <li>Water: Secure a source of clean drinking water if possible.</li>
                <li>First Aid: Address any injuries promptly with available supplies.</li>
                <li>Signal for Help: If safe, try to make your location known (e.g., bright cloth, light).</li>
                <li>Conserve Energy: Both your physical energy and your phone's battery.</li>
                <li>Stay Informed: If possible, listen to a battery-powered radio for updates.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="power-outage">
            <AccordionTrigger className="text-base text-destructive-foreground hover:text-destructive-foreground/80">
                <ZapOff className="mr-2 h-5 w-5" /> Power Outage Tips
            </AccordionTrigger>
            <AccordionContent className="text-destructive-foreground/90">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Use flashlights, not candles, to avoid fire hazards.</li>
                <li>Keep refrigerators and freezers closed to preserve food.</li>
                <li>Unplug appliances to prevent damage from power surges when electricity returns.</li>
                <li>Check on neighbors, especially elderly or vulnerable individuals.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </SectionCard>
  );
}
