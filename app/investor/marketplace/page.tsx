"use client";

import { useState } from "react";
import { mockProposals } from "../../../lib/mock-data";
import InvestmentCard from "../../../components/investor/InvestmentCard";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Filter, Search } from "lucide-react";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Filter marketplace proposals
  const marketplaceProposals = mockProposals.filter(
    (proposal) => proposal.status === "marketplace"
  );
  
  // Apply search filter
  const filteredBySearch = searchQuery
    ? marketplaceProposals.filter(
        (proposal) =>
          proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proposal.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : marketplaceProposals;
  
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
      return b.createdAt.getTime() - a.createdAt.getTime();
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
      
      {sortedProposals.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No opportunities found</h2>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search criteria or check back later
          </p>
          <Button onClick={() => {
            setSearchQuery("");
            setRiskFilter("all");
            setSortBy("newest");
          }}>
            Clear Filters
          </Button>
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