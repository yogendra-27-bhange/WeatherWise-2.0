"use client";

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({ title, icon: Icon, children, className, contentClassName }: SectionCardProps) {
  return (
    <Card className={cn("shadow-lg w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          {Icon && <Icon className="mr-2 h-6 w-6 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("text-sm md:text-base", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
