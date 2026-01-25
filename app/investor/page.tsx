"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowRight, BarChart, LineChart, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { mockInvestments, mockProposals } from "../../lib/mock-data";
import { formatCurrency } from "../../lib/utils";

export default function InvestorHomePage() {
  const router = useRouter();
  
  // Get marketplace opportunities count (with status="marketplace")
  const marketplaceCount = mockProposals.filter(p => p.status === "marketplace").length;
  
  // Calculate total invested
  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.totalAmount, 0);
  
  // Calculate average return
  const averageReturn = mockInvestments.length > 0
    ? mockInvestments.reduce((sum, inv) => sum + (inv.currentReturn / inv.totalAmount) * 100, 0) / mockInvestments.length
    : 0;

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Investor Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to the STD Protocol investor portal
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {marketplaceCount}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Active investment opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(totalInvested)}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total amount invested
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold text-green-600">
                {averageReturn.toFixed(1)}%
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all investments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <LineChart className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {mockInvestments.length}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Currently active investments
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for investors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push("/investor/marketplace")}
              className="w-full justify-between group"
            >
              Browse Investment Opportunities
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              onClick={() => router.push("/investor/portfolio")}
              className="w-full justify-between group"
              variant="outline"
            >
              View Your Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              onClick={() => router.push("/investor/settings")}
              className="w-full justify-between group"
              variant="outline"
            >
              Manage Account Settings
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About STD Protocol</CardTitle>
            <CardDescription>
              Securely Tradable Debts Protocol
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              The STD Protocol enables crypto investors to fund high-margin manufacturing businesses and earn real-world yields. By tokenizing manufacturing debt, we create a bridge between DeFi and traditional manufacturing.
            </p>
            
            <div className="flex items-center gap-4 bg-primary/10 p-4 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium">DAO Governance</h4>
                <p className="text-xs text-muted-foreground">
                  All investment opportunities are vetted and approved by the STD Protocol DAO, ensuring quality and transparency.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => router.push("/dao")}
              variant="outline"
              className="w-full"
            >
              Learn about DAO Membership
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 