"use client";

import { useState, useEffect } from "react";
import { mockTransactions } from "../../../lib/mock-data";
import PortfolioSummary from "../../../components/investor/PortfolioSummary";
import InvestmentsList from "../../../components/investor/InvestmentsList";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { formatCurrency, formatShortDate } from "../../../lib/utils";
import { ArrowDown, ArrowUp, Clock, CreditCard, Loader2 } from "lucide-react";
import { getInvestmentsByAddress } from "../../../lib/utils/investments";
import { getCurrentAddress, initializeProvider } from "../../../lib/utils/daoUtils";
import { toast } from "sonner";

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [mockReturn, setMockReturn] = useState(0);
  const [mockReturnPercentage, setMockReturnPercentage] = useState(0);
  
  // Fetch investments on mount
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        
        // Initialize provider and get wallet address
        await initializeProvider();
        const address = await getCurrentAddress();
        
        if (!address) {
          console.log("No wallet connected");
          setLoading(false);
          return;
        }
        
        setWalletAddress(address);
        
        // Fetch investments from database
        const userInvestments = await getInvestmentsByAddress(address);
        
        // Format investments for the investments list component
        const formattedInvestments = userInvestments.map(inv => {
          const proposalSummary = inv.proposal?.proposalSummary || "Investment in high-margin manufacturing opportunity";
          const proposal = {
            id: inv.proposal?.id || inv.proposalId.toString(),
            title: inv.proposal 
              ? (proposalSummary.substring(0, 50) + (proposalSummary.length > 50 ? '...' : ''))
              : `Proposal #${inv.proposalId}`,
            summary: proposalSummary,
            lotSize: inv.proposal?.lotSize || inv.lotPrice,
            lotPrice: inv.lotPrice,
            profitShare: 12, // Default value, not in contract
            investmentPeriod: 12, // Default value, not in contract
            expectedROI: 18, // Default value, not in contract
            riskScore: 5, // Default value, not in contract
            startDate: inv.purchaseDate,
            endDate: new Date(inv.purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000)), // 1 year from purchase
            status: (inv.proposal?.status || "active") as "active" | "completed" | "cancelled",
          };
          
          // Calculate expected return (mock calculation)
          const expectedReturn = (inv.totalAmount * 12) / 100; // 12% return
          
          return {
            id: inv.id,
            proposal,
            lotsPurchased: inv.lots,
            totalAmount: inv.totalAmount,
            purchaseDate: inv.purchaseDate,
            expectedReturn: expectedReturn,
            actualReturn: 0, // Not tracked yet
            status: inv.status as "active" | "completed" | "cancelled",
          };
        });
        
        setInvestments(formattedInvestments);
      } catch (error) {
        console.error("Error fetching investments:", error);
        toast.error("Failed to load investments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvestments();
  }, []);
  
  // Mock fluctuating returns animation
  useEffect(() => {
    if (investments.length === 0) return;
    
    const interval = setInterval(() => {
      // Generate random fluctuation between -2% and +5% ROI
      const baseReturn = investments.reduce((sum, inv) => sum + inv.totalAmount, 0) * 0.02; // 2% base
      const fluctuation = (Math.random() - 0.3) * baseReturn * 0.5; // Random fluctuation
      const newReturn = Math.max(0, baseReturn + fluctuation);
      
      setMockReturn(newReturn);
      
      // Calculate percentage
      const totalInvested = investments.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const newPercentage = totalInvested > 0 ? (newReturn / totalInvested) * 100 : 0;
      setMockReturnPercentage(newPercentage);
    }, 2000); // Update every 2 seconds
    
    // Initial value
    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalAmount, 0);
    if (totalInvested > 0) {
      const initialReturn = totalInvested * 0.02; // Start at 2%
      setMockReturn(initialReturn);
      setMockReturnPercentage(2.0);
    }
    
    return () => clearInterval(interval);
  }, [investments]);
  
  // Calculate portfolio metrics
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.totalAmount, 
    0
  );
  
  // Use mock returns if there are investments, otherwise use real returns
  const totalReturn = investments.length > 0 ? mockReturn : investments.reduce(
    (sum, inv) => sum + inv.actualReturn, 
    0
  );
  
  const totalValue = totalInvested + totalReturn;
  
  // Use mock percentage if there are investments, otherwise calculate from real returns
  const returnPercentage = investments.length > 0 
    ? mockReturnPercentage
    : (totalInvested > 0 
      ? (investments.reduce((sum, inv) => sum + inv.actualReturn, 0) / totalInvested) * 100 
      : 0);
  
  const totalClaimable = investments.reduce(
    (sum, inv) => sum + (inv.actualReturn || 0), 
    0
  );
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading portfolio...</span>
        </div>
      </div>
    );
  }
  
  if (!walletAddress) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Portfolio</h1>
          <p className="text-muted-foreground mt-2">
            Connect your wallet to view your investments
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to view your investment portfolio
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Portfolio</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track your manufacturing investments
        </p>
      </div>
      
      <div className="mb-8">
        <PortfolioSummary 
          totalInvested={totalInvested}
          totalValue={totalValue}
          totalReturn={totalReturn}
          returnPercentage={returnPercentage}
          totalClaimable={totalClaimable}
          activeInvestments={investments.length}
        />
      </div>
      
      <Tabs defaultValue="investments" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="investments">
          {investments.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  You haven't made any investments yet. Browse the marketplace to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <InvestmentsList 
              investments={investments}
            />
          )}
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === "purchase" ? (
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                          <CreditCard className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="bg-green-100 text-green-700 p-2 rounded-full">
                          <ArrowDown className="h-5 w-5" />
                        </div>
                      )}
                      
                      <div>
                        <div className="font-medium">
                          {transaction.type === "purchase" 
                            ? `Purchased ${transaction.lots} lots of ${transaction.proposalTitle}`
                            : `Return from ${transaction.proposalTitle}`
                          }
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatShortDate(transaction.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`text-right ${transaction.type === "purchase" ? "text-blue-700" : "text-green-700"}`}>
                        {transaction.type === "purchase" ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Badge variant={transaction.type === "purchase" ? "info" : "success"} className="capitalize">
                        {transaction.type}
                      </Badge>
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