"use client";

import React from 'react';
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

export function SectionCard({ title, icon: Icon, children, className = '', contentClassName }: SectionCardProps) {
  return (
    <section className={`section-card animate-fade-in animate-slide-up ${className} p-6 mb-6 bg-white/30 backdrop-blur-xl shadow-xl border border-white/20`}> 
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-6 h-6 text-blue-400 animate-bounce-in" />}
        <h2 className="text-xl font-bold text-blue-700">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
