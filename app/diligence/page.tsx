"use client";

import { useState } from "react";
import { ApplicationDashboard } from "@/components/diligence/ApplicationDashboard";
import { ApplicationAnalytics } from "@/components/diligence/ApplicationAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiligenceDashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diligence Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Review and process manufacturer applications
        </p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-none">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="applications" className="mt-6">
          <ApplicationDashboard />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <ApplicationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
} 