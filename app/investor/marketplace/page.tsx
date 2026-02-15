"use client";

import { useState, useEffect } from "react";
import { getProposalsFromSupabase } from "../../../lib/utils/daoProposals";
import { Proposal } from "../../../lib/utils/daoUtils";
import InvestmentCard from "../../../components/investor/InvestmentCard";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Filter, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch proposals from Supabase
  const fetchProposals = async () => {
    try {
      setLoading(true);
      const allProposals = await getProposalsFromSupabase();
      // Filter for marketplace proposals (executed proposals)
      const marketplaceProposals = allProposals.filter(
        (proposal) => proposal.status === "marketplace"
      );
      setProposals(marketplaceProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    
    // Refresh every 5 seconds to catch newly executed proposals
    const interval = setInterval(() => {
      fetchProposals();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter marketplace proposals
  const marketplaceProposals = proposals;
  
  // Transform proposals to match InvestmentCard format
  const transformedProposals = marketplaceProposals.map((proposal) => {
    const totalFunding = proposal.lotSize * proposal.sharePrice * proposal.maxPerInvestor;
    const totalLots = Math.floor(totalFunding / proposal.sharePrice);
    
    return {
      id: proposal.id,
      title: proposal.proposalSummary.substring(0, 50) + (proposal.proposalSummary.length > 50 ? '...' : ''),
      summary: proposal.proposalSummary,
      lotSize: proposal.lotSize,
      lotPrice: proposal.sharePrice,
      totalLots: totalLots,
      soldLots: 0, // Not tracked yet, will be updated when investment tracking is implemented
      profitShare: 0, // Not available in proposal, can be calculated or set default
      investmentPeriod: 0, // Not available in proposal
      expectedROI: 0, // Not available in proposal
      riskScore: 5, // Default risk score, can be calculated based on proposal data
    };
  });
  
  // Apply search filter
  const filteredBySearch = searchQuery
    ? transformedProposals.filter(
        (proposal) =>
          proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proposal.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transformedProposals;
  
  // Apply risk filter
  const filteredByRisk = riskFilter === "all"
    ? filteredBySearch
    : filteredBySearch.filter((proposal) => {
        if (riskFilter === "low") return proposal.riskScore <= 3;
        if (riskFilter === "medium") return proposal.riskScore > 3 && proposal.riskScore <= 7;
        return proposal.riskScore > 7;
      });
  
  // Sort results
  const sortedProposals = [...filteredByRisk].sort((a, b) => {
    if (sortBy === "newest") {
      const aDate = marketplaceProposals.find(p => p.id === a.id)?.createdAt || new Date();
      const bDate = marketplaceProposals.find(p => p.id === b.id)?.createdAt || new Date();
      return bDate.getTime() - aDate.getTime();
    }
    if (sortBy === "highestReturn") {
      return b.expectedROI - a.expectedROI;
    }
    if (sortBy === "lowestRisk") {
      return a.riskScore - b.riskScore;
    }
    // fundingProgress
    const aProgress = (a.soldLots / a.totalLots) * 100;
    const bProgress = (b.soldLots / b.totalLots) * 100;
    return bProgress - aProgress;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Browse investment opportunities</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Card className="p-0 shadow-none border-0">
            <CardContent className="p-0 flex flex-row gap-2">
              <Select
                value={riskFilter}
                onValueChange={setRiskFilter}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="highestReturn">Highest Return</SelectItem>
                  <SelectItem value="lowestRisk">Lowest Risk</SelectItem>
                  <SelectItem value="fundingProgress">Funding Progress</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading proposals...</span>
        </div>
      ) : sortedProposals.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No opportunities found</h2>
          <p className="text-muted-foreground mb-6">
            {marketplaceProposals.length === 0 
              ? "No executed proposals available yet. Check back after proposals are executed."
              : "Try adjusting your search criteria or check back later"}
          </p>
          {marketplaceProposals.length > 0 && (
            <Button onClick={() => {
              setSearchQuery("");
              setRiskFilter("all");
              setSortBy("newest");
            }}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProposals.map((proposal) => (
            <InvestmentCard 
              key={proposal.id} 
              proposal={proposal}
            />
          ))}
        </div>
      )}
    </div>
  );
} 