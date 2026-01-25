"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockProposals } from "@/lib/mock-data";
import ProposalCard from "@/components/dao/ProposalCard";
import { ArrowLeft, PlusCircle, Search, Wallet, BarChart, Users, VoteIcon, Briefcase } from "lucide-react";
import { connectWallet, MOCK_WALLET_ADDRESS } from "@/lib/utils";

// Define the status type to fix TypeScript error
type ProposalStatus = "voting" | "closed" | "marketplace";

export default function DAOPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | ProposalStatus>("all");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Filter proposals based on search query and active tab
  const filteredProposals = mockProposals.filter((proposal) => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return proposal.status === activeTab && matchesSearch;
  });

  // Count proposals by status
  const proposalCounts = {
    total: mockProposals.length,
    voting: mockProposals.filter(p => p.status === "voting").length,
    closed: mockProposals.filter(p => p.status === "closed").length,
    marketplace: mockProposals.filter(p => p.status === "marketplace").length
  };

  const handleConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.connected) {
        setIsConnected(true);
        setWalletAddress(result.address);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  useEffect(() => {
    // Simulate wallet connection if needed for demo
    const checkConnection = async () => {
      if (localStorage.getItem("wallet-connected") === "true") {
        setIsConnected(true);
        setWalletAddress(MOCK_WALLET_ADDRESS);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
            {isConnected ? (
            <div className="flex items-center px-3 py-2 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                <Wallet className="h-4 w-4 mr-2" />
                <span className="hidden md:inline mr-2">Connected:</span>
                <span className="font-mono">{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
              </div>
            ) : (
              <Button onClick={handleConnect} variant="outline" size="sm" className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DAO Proposals</h1>
          <p className="mt-2 text-gray-500">
            Vote on investment proposals and shape the future of the protocol.
          </p>
        </div>

        {/* Quick stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Proposals
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Voting
              </CardTitle>
              <VoteIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.voting}</div>
              <p className="text-xs text-muted-foreground">
                Proposals awaiting DAO votes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Marketplace Listings
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.marketplace}</div>
              <p className="text-xs text-muted-foreground">
                Open for investment
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Closed Proposals
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.closed}</div>
              <p className="text-xs text-muted-foreground">
                Historical voting results
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Proposal Directory</CardTitle>
            <Link href={isConnected ? "/dao/proposals/new" : "#"} onClick={e => !isConnected && e.preventDefault()}>
              <Button 
                variant="default" 
                size="sm" 
                  className="gap-2 w-full md:w-auto"
                disabled={!isConnected}
              >
                <PlusCircle className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
          </div>
            <CardDescription>Browse and vote on active investment proposals</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as typeof activeTab)} 
                className="w-full md:w-auto"
              >
              <TabsList className="grid grid-cols-4 md:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="voting">Voting</TabsTrigger>
                  <TabsTrigger value="marketplace">Market</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredProposals.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-md border">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-800 mb-1">No proposals found</p>
                <p className="text-gray-500 mb-4">No proposals match your current filters</p>
              {searchQuery && (
                <Button
                    variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal as any} />
              ))}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 