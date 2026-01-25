"use client";

import { mockInvestments, mockTransactions } from "../../../lib/mock-data";
import PortfolioSummary from "../../../components/investor/PortfolioSummary";
import InvestmentsList from "../../../components/investor/InvestmentsList";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { formatCurrency, formatShortDate } from "../../../lib/utils";
import { ArrowDown, ArrowUp, Clock, CreditCard } from "lucide-react";

export default function PortfolioPage() {
  // Calculate portfolio metrics
  const totalInvested = mockInvestments.reduce(
    (sum, inv) => sum + inv.totalAmount, 
    0
  );
  
  const totalReturn = mockInvestments.reduce(
    (sum, inv) => sum + inv.currentReturn, 
    0
  );
  
  const totalValue = totalInvested + totalReturn;
  
  const returnPercentage = totalInvested > 0 
    ? (totalReturn / totalInvested) * 100 
    : 0;
  
  const totalClaimable = mockInvestments.reduce(
    (sum, inv) => sum + inv.claimableReturn, 
    0
  );
  
  // Format investments for the investments list component
  const formattedInvestments = mockInvestments.map(inv => {
    const proposal = {
      id: inv.proposalId,
      title: inv.proposalId === "4" 
        ? "Industrial Equipment Production"
        : inv.proposalId === "5"
          ? "Electronics Assembly Expansion"
          : "Advanced Materials Production",
      summary: "Investment in high-margin manufacturing opportunity",
      lotSize: inv.lotPrice,
      lotPrice: inv.lotPrice,
      profitShare: 15, // Mock value
      investmentPeriod: 12, // Mock value
      expectedROI: 20, // Mock value
      riskScore: 4, // Mock value
      startDate: inv.purchaseDate,
      endDate: new Date(inv.purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000)), // 1 year from purchase
      status: "active" as const,
    };
    
    return {
      id: inv.id,
      proposal,
      lotsPurchased: inv.lots,
      totalAmount: inv.totalAmount,
      purchaseDate: inv.purchaseDate,
      expectedReturn: inv.expectedReturn,
      actualReturn: inv.currentReturn,
      status: "active" as const,
    };
  });
  
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
          activeInvestments={mockInvestments.length}
        />
      </div>
      
      <Tabs defaultValue="investments" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="investments">
          <InvestmentsList 
            investments={formattedInvestments}
          />
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