'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Users, ChartBar, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle2, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
      <div className="text-center max-w-3xl mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Securely Tradable Debts Protocol
        </h1>
        <p className="text-xl text-muted-foreground">
          Tokenize high-margin manufacturing debt, enabling crypto investors to fund manufacturers and earn real-world yields.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Manufacturer Portal</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Submit applications for funding
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Register company details</li>
              <li>Upload required documents</li>
              <li>Track application status</li>
              <li>Communicate with reviewers</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Link href="/manufacturer" className="w-full">
              <Button variant="outline" className="w-full">
                Access Portal
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-primary">Diligence Dashboard</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>
              Review manufacturer applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Process applications efficiently</li>
              <li>Review document submissions</li>
              <li>Request additional information</li>
              <li>Create DAO proposals</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Link href="/diligence" className="w-full">
              <Button variant="default" className="w-full">
                Enter Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">DAO Governance</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Vote on investment proposals
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>View detailed proposals</li>
              <li>Vote on funding terms</li>
              <li>Discuss with other members</li>
              <li>Track proposal status</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Link href="/dao" className="w-full">
              <Button variant="outline" className="w-full">
                Join DAO
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Investor Marketplace</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Fund manufacturing projects
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Browse investment opportunities</li>
              <li>Access detailed documentation</li>
              <li>Purchase lots with set returns</li>
              <li>Track investment portfolio</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Link href="/investor" className="w-full">
              <Button variant="outline" className="w-full">
                Explore Investments
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to explore the diligence interface?</h2>
        <Link href="/diligence">
          <Button size="lg" className="mt-2">
            Go to Diligence Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
