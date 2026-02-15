'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FinanceCharts } from '@/components/landing/FinanceCharts';
import { RWAFlow } from '@/components/landing/RWAFlow';
import { TrustCompliance } from '@/components/landing/TrustCompliance';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <HeroSection />
      <FinanceCharts />
      <RWAFlow />
      <TrustCompliance />
      <LandingFooter />
    </div>
  );
}
