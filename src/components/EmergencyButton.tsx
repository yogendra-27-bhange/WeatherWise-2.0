"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Siren, Phone, Mail, MessageSquare, QrCode } from 'lucide-react';
import QRCodeStylized from 'qrcode.react'; // Changed import name for clarity

interface EmergencyButtonProps {
  latitude?: number | null;
  longitude?: number | null;
  currentStatus?: string | null; // e.g., "Safe", "Needs Help"
}

export function EmergencyButton({ latitude, longitude, currentStatus = "Status Unknown" }: EmergencyButtonProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (latitude && longitude) {
      const locationString = `Location: ${latitude}, ${longitude}`;
      const statusString = `Status: ${currentStatus}`;
      // Basic info, can be expanded. A hosted page URL would be better for more complex data.
      setQrValue(`Emergency Info:\n${locationString}\n${statusString}\nTimestamp: ${new Date().toISOString()}`);
    } else {
      setQrValue(`Emergency Info:\nLocation: Not available\nStatus: ${currentStatus}\nTimestamp: ${new Date().toISOString()}`);
    }
  }, [latitude, longitude, currentStatus, isAlertOpen]);


  const handleContact = (type: 'tel' | 'mailto' | 'sms') => {
    let url = '';
    const phoneNumber = '911'; 
    const emailAddress = 'emergency@example.com';
    const smsNumber = '911'; 

    let body = `EMERGENCY: I need help.`;
    if (latitude && longitude) {
      body += ` My approximate location is ${latitude},${longitude}.`;
    }
     body += ` Current status: ${currentStatus}.`;


    switch (type) {
      case 'tel':
        url = `tel:${phoneNumber}`;
        break;
      case 'mailto':
        url = `mailto:${emailAddress}?subject=Emergency Assistance Needed&body=${encodeURIComponent(body)}`;
        break;
      case 'sms':
        // Note: SMS body length can be an issue on some devices/OS
        url = `sms:${smsNumber}?body=${encodeURIComponent(body.substring(0,150))}`; // Limit SMS length
        break;
    }
    window.open(url, '_self');
    setIsAlertOpen(false);
    setShowQrCode(false);
  };
  
  const toggleQrCode = () => {
    setShowQrCode(prev => !prev);
  }

  return (
    <div>
      <AlertDialog open={isAlertOpen} onOpenChange={(open) => { setIsAlertOpen(open); if(!open) setShowQrCode(false);}}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full p-4 shadow-xl animate-pulse hover:animate-none flex items-center gap-2 h-16 w-16 md:h-auto md:w-auto md:px-6 bg-red-600 hover:bg-red-700 text-white border-none"
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
              {showQrCode ? "Scan this QR code with another device to share your location and status." : "Are you in an emergency situation? Choose an option below. If in immediate danger, call emergency services directly."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {showQrCode ? (
            <div className="flex flex-col items-center justify-center my-4">
              {qrValue && (
                <QRCodeStylized
                  value={qrValue}
                  size={200}
                  level="M" // Error correction level
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center whitespace-pre-wrap">{qrValue}</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
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
            </div>
          )}

          <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:justify-between items-center mt-4">
             <Button
                variant="ghost"
                size="lg"
                onClick={toggleQrCode}
                className="w-full sm:w-auto justify-start text-lg py-3"
              >
                <QrCode className="mr-3 h-5 w-5" /> {showQrCode ? "Show Contact Options" : "Show My QR Code"}
            </Button>
            <AlertDialogCancel asChild>
               <Button variant={showQrCode ? "outline" : "ghost"} size="lg" className="w-full sm:w-auto text-lg py-3">Cancel</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
