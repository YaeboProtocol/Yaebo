"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { mockProposals } from "../../lib/mock-data";
import ProposalCard from "../../components/dao/ProposalCard";
import { ArrowLeft, PlusCircle, Search, Wallet } from "lucide-react";
import { connectWallet, MOCK_WALLET_ADDRESS } from "../../lib/utils";

export default function DAOPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Filter proposals based on search query and active tab
  const filteredProposals = mockProposals.filter((proposal) => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return proposal.status === activeTab && matchesSearch;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DAO Proposals</h1>
            <p className="mt-2 text-gray-500">
              Vote on investment proposals and shape the future of the protocol.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm">
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
            
            <Link href={isConnected ? "/dao/proposals/new" : "#"} onClick={e => !isConnected && e.preventDefault()}>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2"
                disabled={!isConnected}
              >
                <PlusCircle className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
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
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 md:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="voting">Voting</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No proposals found matching your criteria.</p>
              {searchQuery && (
                <Button
                  variant="link"
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
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 