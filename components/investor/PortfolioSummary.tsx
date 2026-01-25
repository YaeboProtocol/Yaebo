"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { 
  CircleDollarSign, 
  TrendingUp, 
  BarChart, 
  Clock 
} from "lucide-react";
import { formatCurrency, formatPercentage } from "../../lib/utils";

interface PortfolioSummaryProps {
  totalInvested: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  totalClaimable: number;
  activeInvestments: number;
}

export default function PortfolioSummary({
  totalInvested,
  totalValue,
  totalReturn,
  returnPercentage,
  totalClaimable,
  activeInvestments,
}: PortfolioSummaryProps) {
  
  // Calculate the return color based on percentage
  const getReturnColor = (percentage: number) => {
    if (percentage >= 0) return "text-green-500";
    return "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CircleDollarSign className="h-5 w-5 text-primary mr-2" />
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvested)}
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across {activeInvestments} active investments
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BarChart className="h-5 w-5 text-primary mr-2" />
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Including unrealized returns
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Returns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-primary mr-2" />
            <div className="text-2xl font-bold flex items-center">
              <span className={getReturnColor(returnPercentage)}>
                {formatCurrency(totalReturn)}
              </span>
              <span className={`ml-2 text-sm ${getReturnColor(returnPercentage)}`}>
                {formatPercentage(returnPercentage)}
              </span>
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            ROI: {formatPercentage(returnPercentage)}
          </div>
        </CardContent>
      </Card>
      
      <Card className={totalClaimable > 0 ? "border-green-200 bg-green-50" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Claimable Returns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalClaimable)}
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {totalClaimable > 0 
              ? "Available to claim now"
              : "No returns available to claim"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 