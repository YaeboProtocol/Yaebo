"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { 
  Badge, 
  Button, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../ui";
import { 
  CalendarClock, 
  CircleDollarSign, 
  ClipboardCheck, 
  ExternalLink, 
  Filter, 
  InfoIcon, 
  Percent
} from "lucide-react";
import { 
  calculateTimeLeft, 
  formatCurrency, 
  formatPercentage, 
  formatShortDate, 
  getRiskScoreColor 
} from "../../lib/utils";

interface Investment {
  id: string;
  proposal: {
    id: string;
    title: string;
    summary: string;
    lotSize: number;
    lotPrice: number;
    profitShare: number;
    investmentPeriod: number;
    expectedROI: number;
    riskScore: number;
    startDate: Date;
    endDate: Date;
    status: "active" | "completed" | "defaulted";
  };
  lotsPurchased: number;
  totalAmount: number;
  purchaseDate: Date;
  expectedReturn: number;
  actualReturn?: number;
  status: "active" | "completed" | "defaulted";
}

interface InvestmentsListProps {
  investments: Investment[];
}

export default function InvestmentsList({ investments }: InvestmentsListProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "defaulted">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "return">("date");

  // Filter investments based on status
  const filteredInvestments = filter === "all" 
    ? investments 
    : investments.filter((investment) => investment.status === filter);

  // Sort investments based on selected criteria
  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    if (sortBy === "date") {
      return b.purchaseDate.getTime() - a.purchaseDate.getTime();
    } else if (sortBy === "amount") {
      return b.totalAmount - a.totalAmount;
    } else {
      return b.expectedReturn - a.expectedReturn;
    }
  });

  const getStatusBadge = (status: "active" | "completed" | "defaulted") => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "defaulted":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Defaulted</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Your Investments</CardTitle>
            <CardDescription>
              {filteredInvestments.length} investment{filteredInvestments.length !== 1 ? "s" : ""} found
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                defaultValue="all"
                onValueChange={(value) => setFilter(value as any)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
              <Select
                defaultValue="date"
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedInvestments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">No investments found</p>
            <Button variant="outline" className="mt-4">
              Browse Opportunities
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedInvestments.map((investment) => (
              <div 
                key={investment.id} 
                className={`border rounded-lg p-4 ${
                  investment.status === "active" ? "border-blue-200 bg-blue-50/30" :
                  investment.status === "completed" ? "border-green-200 bg-green-50/30" :
                  "border-red-200 bg-red-50/30"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-lg">
                        {investment.proposal.title}
                      </h3>
                      {getStatusBadge(investment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {investment.proposal.summary}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount Invested</p>
                        <div className="flex items-center mt-1">
                          <CircleDollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                          <p className="font-medium">{formatCurrency(investment.totalAmount)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Return</p>
                        <div className="flex items-center mt-1">
                          <Percent className="h-4 w-4 text-muted-foreground mr-1" />
                          <p className="font-medium">{formatPercentage(investment.proposal.expectedROI)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Purchase Date</p>
                        <div className="flex items-center mt-1">
                          <ClipboardCheck className="h-4 w-4 text-muted-foreground mr-1" />
                          <p className="font-medium">{formatShortDate(investment.purchaseDate)}</p>
                        </div>
                      </div>
                      {investment.status === "active" ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Time Remaining</p>
                          <div className="flex items-center mt-1">
                            <CalendarClock className="h-4 w-4 text-muted-foreground mr-1" />
                            <p className="font-medium">
                              {calculateTimeLeft(investment.proposal.endDate)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {investment.status === "completed" ? "Actual Return" : "End Date"}
                          </p>
                          <div className="flex items-center mt-1">
                            {investment.status === "completed" ? (
                              <>
                                <CircleDollarSign className="h-4 w-4 text-green-500 mr-1" />
                                <p className="font-medium text-green-600">
                                  {formatCurrency(investment.actualReturn || 0)}
                                </p>
                              </>
                            ) : (
                              <>
                                <CalendarClock className="h-4 w-4 text-muted-foreground mr-1" />
                                <p className="font-medium">
                                  {formatShortDate(investment.proposal.endDate)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" className="mr-2">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {investment.status === "completed" && (
                    <Button variant="default" size="sm">
                      Download Certificate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 