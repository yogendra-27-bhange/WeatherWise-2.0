"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Siren, Phone, Mail, MessageSquare } from 'lucide-react';

export function EmergencyButton() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleContact = (type: 'tel' | 'mailto' | 'sms') => {
    let url = '';
    // Use generic numbers/emails for example purposes
    const phoneNumber = '911'; // Example emergency number
    const emailAddress = 'emergency@example.com';
    const smsNumber = '911'; // Example SMS number

    switch (type) {
      case 'tel':
        url = `tel:${phoneNumber}`;
        break;
      case 'mailto':
        url = `mailto:${emailAddress}?subject=Emergency Assistance Needed`;
        break;
      case 'sms':
        url = `sms:${smsNumber}?body=EMERGENCY: I need help. My approximate location is [Share Location if possible].`;
        break;
    }
    window.open(url, '_self');
    setIsAlertOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full p-4 shadow-xl animate-pulse hover:animate-none flex items-center gap-2 h-16 w-16 md:h-auto md:w-auto md:px-6"
            aria-label="Emergency SOS"
          >
            <Siren className="h-8 w-8 md:h-6 md:w-6" />
            <span className="hidden md:inline font-bold text-lg">SOS</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center">
              <Siren className="h-7 w-7 mr-2 text-destructive" /> Emergency Options
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you in an emergency situation? Choose an option below to get help.
              If you are in immediate danger, please call your local emergency number directly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col space-y-2 sm:space-y-2 sm:space-x-0">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleContact('tel')}
              className="w-full justify-start text-lg py-3"
              aria-label="Call emergency services"
            >
              <Phone className="mr-3 h-5 w-5" /> Call Emergency Services
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleContact('mailto')}
              className="w-full justify-start text-lg py-3"
              aria-label="Email for emergency help"
            >
              <Mail className="mr-3 h-5 w-5" /> Email for Help
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleContact('sms')}
              className="w-full justify-start text-lg py-3"
              aria-label="Send SMS for emergency help"
            >
              <MessageSquare className="mr-3 h-5 w-5" /> Send SMS for Help
            </Button>
            <AlertDialogCancel asChild className="mt-4">
               <Button variant="ghost" size="lg" className="w-full text-lg py-3">Cancel</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
