"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  BarChart, 
  LineChart, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Wallet, 
  ChevronRight, 
  CircleDollarSign,
  Home,
  LayoutDashboard,
  BookOpen,
  Copy,
  CheckCircle2
} from "lucide-react";
import { mockInvestments, mockProposals } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { connectWithMetamask, initializeProvider, getCurrentAddress } from "@/lib/utils/daoUtils";
import { checkEtherlinkNetwork, switchToEtherlinkNetwork } from "@/lib/utils/network";
import { toast } from "sonner";

export default function InvestorHomePage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            await initializeProvider();
            const address = await getCurrentAddress();
            if (address) {
              setIsConnected(true);
              setWalletAddress(address);
            }
          }
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };

    checkWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setWalletAddress("");
      } else if (accounts[0] !== walletAddress) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [walletAddress]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      const isOnEtherlink = await checkEtherlinkNetwork();
      if (!isOnEtherlink) {
        toast.info("Please switch to Etherlink Shadownet network");
        try {
          await switchToEtherlinkNetwork();
          toast.success("Switched to Etherlink Shadownet network");
        } catch (switchError) {
          toast.error("Please manually switch to Etherlink Shadownet network in MetaMask");
          setIsConnecting(false);
          return;
        }
      }

      await connectWithMetamask();
      const address = await getCurrentAddress();
      
      if (address) {
        setIsConnected(true);
        setWalletAddress(address);
        toast.success("Wallet connected successfully");
      } else {
        toast.error("Failed to connect wallet");
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    toast.info("Wallet disconnected");
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Get marketplace opportunities count (with status="marketplace")
  const marketplaceCount = mockProposals.filter(p => p.status === "marketplace").length;
  
  // Calculate total invested
  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.totalAmount, 0);
  
  // Calculate average return
  const averageReturn = mockInvestments.length > 0
    ? mockInvestments.reduce((sum, inv) => sum + (inv.currentReturn / inv.totalAmount) * 100, 0) / mockInvestments.length
    : 0;

  // Get recent opportunities
  const recentOpportunities = mockProposals
    .filter(p => p.status === "marketplace")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Navigation options
  const navigationOptions = [
    {
      title: "Marketplace",
      description: "Browse investment opportunities",
      icon: <ShoppingBag className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50",
      href: "/investor/marketplace",
      badge: marketplaceCount.toString()
    },
    {
      title: "Portfolio",
      description: "Track your investments",
      icon: <LayoutDashboard className="h-8 w-8 text-green-500" />,
      color: "bg-green-50",
      href: "/investor/portfolio", 
      badge: mockInvestments.length.toString()
    },
    {
      title: "DAO",
      description: "Participate in governance",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-50",
      href: "/dao"
    },
    {
      title: "Learn",
      description: "Education and resources",
      icon: <BookOpen className="h-8 w-8 text-amber-500/60" />,
      color: "bg-amber-50/60",
      href: "#",
      disabled: true,
      comingSoon: true
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm border border-green-100">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="font-mono">{formatAddress(walletAddress)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyAddress}
                  className="h-8 w-8"
                  title="Copy address"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-xs"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
          <p className="mt-2 text-gray-500">
            Welcome to the TachyonX investor portal
          </p>
        </div>
        
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {navigationOptions.map((option) => (
            <Card 
              key={option.title} 
              className={`hover:shadow-md transition-shadow ${option.disabled ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !option.disabled && router.push(option.href)}
            >
              <CardContent className="p-6 relative">
                {option.comingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] rounded-lg z-10">
                    <Badge variant="secondary" className="bg-black/50 text-white border-none px-3 py-1.5">
                      Coming Soon
                    </Badge>
                  </div>
                )}
                <div className={`${option.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                  {option.icon}
                </div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {option.title}
                  {option.badge && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {option.badge}
                    </span>
                  )}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Opportunities
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketplaceCount}</div>
              <p className="text-xs text-muted-foreground">
                Active investment opportunities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Portfolio Value
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground">
                Across all investments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Return
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {8}%
              </div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Investments
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockInvestments.length}</div>
              <p className="text-xs text-muted-foreground">
                Diversified across {mockInvestments.length} projects
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Opportunities</CardTitle>
                <Button 
                  onClick={() => router.push("/investor/marketplace")}
                  variant="ghost" 
                  size="sm" 
                  className="text-primary gap-1"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Latest investment opportunities available on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{opportunity.title}</span>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <Wallet className="h-3.5 w-3.5 mr-1.5" />
                          {formatCurrency(opportunity.fundingAmount)}
                        </span>
                        <span className="flex items-center text-green-600">
                          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                          {opportunity.profitShare}% return
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push(`/investor/marketplace/${opportunity.id}`)}
                      variant="outline" 
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                ))}

                {recentOpportunities.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No active opportunities found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>
                Useful resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => router.push("/investor/portfolio")}
                className="w-full justify-between group"
                variant="outline"
              >
                View Your Portfolio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              {/* <Button 
                onClick={() => router.push("/investor/settings")}
                className="w-full justify-between group"
                variant="outline"
              >
                Account Settings
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
               */}
              <Button 
                onClick={() => router.push("/dao")}
                className="w-full justify-between group"
                variant="outline"
              >
                Governance Portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 