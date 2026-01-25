"use client";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import Link from "next/link";
import { 
  BarChart, 
  CalendarClock, 
  Clock, 
  DollarSign, 
  Percent, 
  TrendingUp 
} from "lucide-react";
import { calculateFundingProgress, formatCurrency, getRiskScoreColor } from "../../lib/utils";

interface InvestmentCardProps {
  proposal: {
    id: string;
    title: string;
    summary: string;
    lotSize: number;
    lotPrice: number;
    totalLots: number;
    soldLots: number;
    profitShare: number;
    investmentPeriod: number;
    expectedROI: number;
    riskScore: number;
  };
}

export default function InvestmentCard({ proposal }: InvestmentCardProps) {
  const { 
    id, 
    title, 
    summary, 
    lotSize, 
    lotPrice, 
    totalLots, 
    soldLots,
    profitShare,
    investmentPeriod,
    expectedROI,
    riskScore
  } = proposal;

  const fundingProgress = calculateFundingProgress(soldLots, totalLots);
  const lotsRemaining = totalLots - soldLots;
  
  const getRiskLabel = (score: number) => {
    if (score <= 3) return "Low Risk";
    if (score <= 7) return "Medium Risk";
    return "High Risk";
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold line-clamp-1">{title}</CardTitle>
          <Badge className={`ml-2 ${getRiskScoreColor(riskScore)} bg-opacity-20`}>
            {getRiskLabel(riskScore)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{summary}</p>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Lot Price</p>
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              {formatCurrency(lotPrice)}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Profit Share</p>
            <div className="flex items-center gap-1 font-medium">
              <Percent className="h-3.5 w-3.5 text-primary" />
              {profitShare}%
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Period</p>
            <div className="flex items-center gap-1 font-medium">
              <CalendarClock className="h-3.5 w-3.5 text-primary" />
              {investmentPeriod} months
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expected ROI</p>
            <div className="flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {expectedROI}%
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Funding progress</span>
            <span className="text-xs font-medium">{fundingProgress}%</span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {lotsRemaining === 0 ? (
                <span className="text-green-600 font-medium">Fully Funded</span>
              ) : (
                <span>{lotsRemaining} {lotsRemaining === 1 ? 'lot' : 'lots'} remaining</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground flex items-center">
              <BarChart className="h-3 w-3 mr-1" />
              Risk Score: <span className={`ml-1 ${getRiskScoreColor(riskScore)}`}>{riskScore}/10</span>
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full flex justify-end space-x-2">
          <Link href={`/investor/marketplace/${id}`} className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              View Details
            </Button>
          </Link>
          <Link href={`/investor/marketplace/${id}`} className="w-full sm:w-auto">
            <Button 
              size="sm"
              className="w-full"
              disabled={lotsRemaining === 0}
            >
              {lotsRemaining === 0 ? "Sold Out" : "Invest Now"}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 