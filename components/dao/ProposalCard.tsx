"use client"

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { formatCurrency, formatRemainingTime } from "../../lib/utils";
import { Calendar, Clock, DollarSign, Wallet, TrendingUp, BarChart } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    summary: string;
    fundingAmount: number;
    profitShare: number;
    lotSize: number;
    lotPrice: number;
    maxPerInvestor: number;
    status: "voting" | "closed" | "marketplace";
    votingEndsAt: Date;
    createdAt: Date;
    totalLots?: number;
    soldLots?: number;
  };
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const {
    id,
    title,
    summary,
    fundingAmount,
    profitShare,
    lotSize,
    lotPrice,
    maxPerInvestor,
    status,
    votingEndsAt,
    createdAt,
    totalLots = 0,
    soldLots = 0,
  } = proposal;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "voting":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "marketplace":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "voting":
        return <Clock className="h-3.5 w-3.5 mr-1.5" />;
      case "marketplace":
        return <BarChart className="h-3.5 w-3.5 mr-1.5" />;
      case "closed":
        return <TrendingUp className="h-3.5 w-3.5 mr-1.5" />;
      default:
        return null;
    }
  };

  const fundingProgress = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{title}</CardTitle>
          <Badge variant="secondary" className={`flex items-center ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            {status === "marketplace" ? "Market" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 mt-1">{summary}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow pb-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Funding Amount</p>
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="h-4 w-4 text-primary" />
              {formatCurrency(fundingAmount)}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Profit Share</p>
            <div className="flex items-center gap-1 font-medium">
              <Wallet className="h-4 w-4 text-primary" />
              {profitShare}%
            </div>
          </div>
        </div>

        {status === "voting" && (
          <div className="mt-auto">
            <div className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-1.5 rounded-md text-sm">
              <Clock className="h-4 w-4" />
              <span>Voting ends: {formatRemainingTime(votingEndsAt)}</span>
            </div>
          </div>
        )}

        {status === "marketplace" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Funding progress</span>
              <span className="text-xs font-medium">{fundingProgress}%</span>
            </div>
            <Progress value={fundingProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              {soldLots} of {totalLots} lots sold
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
        <Link href={`/dao/proposals/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 