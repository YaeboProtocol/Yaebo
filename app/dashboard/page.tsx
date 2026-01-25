"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ArrowUpRight, BarChart3, FileText, ListChecks, Package, Users } from "lucide-react";
import { FileBrowser } from "../../components/ui/file-browser";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<string | null>(null);

  // In a real app, we'd fetch this from the server
  useEffect(() => {
    // Mock user role for demo purposes
    setUserRole("investor");
  }, []);

  return (
    <div className="flex min-h-screen flex-col gap-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the STD Protocol platform. Manage your investments and track performance.
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,500</div>
                <p className="text-xs text-muted-foreground">Across 3 proposals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Yield</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5%</div>
                <p className="text-xs text-muted-foreground">Average annualized</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">1 pending approval</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Invested in Lot #42", date: "2 hours ago", amount: "$4,500" },
                    { action: "Claimed returns", date: "3 days ago", amount: "$320" },
                    { action: "Voted on proposal", date: "1 week ago", amount: null },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      {activity.amount && <div className="font-medium">{activity.amount}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Recommended Opportunities</CardTitle>
                <CardDescription>Based on your investment profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Manufacturing Equipment Lot #58", yield: "9.2%", risk: "Medium" },
                    { name: "Component Production Lot #23", yield: "7.5%", risk: "Low" },
                  ].map((opportunity, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{opportunity.name}</p>
                        <p className="text-sm text-muted-foreground">Expected yield: {opportunity.yield} | Risk: {opportunity.risk}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/marketplace">
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Investments</CardTitle>
              <CardDescription>Track your active investments and returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Manufacturing Equipment Lot #42", invested: "$4,500", yield: "8.5%", status: "Active", maturity: "Dec 2023" },
                  { name: "Component Production Lot #17", invested: "$10,000", yield: "7.2%", status: "Active", maturity: "Mar 2024" },
                  { name: "Assembly Line Lot #08", invested: "$10,000", yield: "9.5%", status: "Active", maturity: "Jan 2024" },
                ].map((investment, i) => (
                  <div key={i} className="grid grid-cols-5 border-b pb-2 last:border-0">
                    <div className="col-span-2">
                      <p className="font-medium">{investment.name}</p>
                      <p className="text-sm text-muted-foreground">Invested: {investment.invested}</p>
                    </div>
                    <div>
                      <p className="font-medium">{investment.yield}</p>
                      <p className="text-sm text-muted-foreground">Yield</p>
                    </div>
                    <div>
                      <p className="font-medium">{investment.status}</p>
                      <p className="text-sm text-muted-foreground">Status</p>
                    </div>
                    <div>
                      <p className="font-medium">{investment.maturity}</p>
                      <p className="text-sm text-muted-foreground">Maturity</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Returns History</CardTitle>
              <CardDescription>Your historical investment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "Oct 15, 2023", amount: "$320", source: "Component Production Lot #17" },
                  { date: "Sep 15, 2023", amount: "$320", source: "Component Production Lot #17" },
                  { date: "Aug 15, 2023", amount: "$320", source: "Component Production Lot #17" },
                ].map((return_, i) => (
                  <div key={i} className="grid grid-cols-3 border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{return_.date}</p>
                      <p className="text-sm text-muted-foreground">Payment Date</p>
                    </div>
                    <div>
                      <p className="font-medium">{return_.amount}</p>
                      <p className="text-sm text-muted-foreground">Amount</p>
                    </div>
                    <div>
                      <p className="font-medium">{return_.source}</p>
                      <p className="text-sm text-muted-foreground">Source</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Files</CardTitle>
              <CardDescription>View and manage your documents</CardDescription>
            </CardHeader>
            <CardContent>
              <FileBrowser 
                bucket="investor-docs"
                entityId="mock-investor-id"
                entityType="investor"
                emptyStateMessage="No documents uploaded yet"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Opportunities</CardTitle>
              <CardDescription>Browse new investment opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { 
                    name: "Manufacturing Equipment Lot #58", 
                    description: "Funding for specialized manufacturing equipment for automotive components",
                    company: "AutoTech Manufacturing Inc.", 
                    target: "$250,000", 
                    funded: "62%", 
                    yield: "9.2%", 
                    term: "18 months",
                    lotSize: "$2,500"
                  },
                  { 
                    name: "Component Production Lot #23", 
                    description: "Expansion of production capacity for electronic components",
                    company: "ElectraTech Solutions", 
                    target: "$180,000", 
                    funded: "45%", 
                    yield: "7.5%", 
                    term: "12 months",
                    lotSize: "$1,000"
                  },
                ].map((opportunity, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold text-lg">{opportunity.name}</h3>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {opportunity.yield} APY
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
                    <p className="text-sm mb-3">by <span className="font-medium">{opportunity.company}</span></p>
                    
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="font-medium">{opportunity.target}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Funded</p>
                        <p className="font-medium">{opportunity.funded}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Term</p>
                        <p className="font-medium">{opportunity.term}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lot Size</p>
                        <p className="font-medium">{opportunity.lotSize}</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-secondary h-2 rounded-full mb-4">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: opportunity.funded }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 