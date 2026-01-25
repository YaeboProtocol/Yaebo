"use client"

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { formatCurrency, formatRemainingTime } from "../../lib/utils";
import { Calendar, Clock, DollarSign, Wallet } from "lucide-react";
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

  const fundingProgress = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold line-clamp-1">{title}</CardTitle>
          <Badge className={`ml-2 ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Funding</p>
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="h-4 w-4 text-primary" />
              {formatCurrency(fundingAmount)}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profit Share</p>
            <div className="flex items-center gap-1 font-medium">
              <Wallet className="h-4 w-4 text-primary" />
              {profitShare}%
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lot Size</p>
            <p className="font-medium">{formatCurrency(lotSize)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Max Per Investor</p>
            <p className="font-medium">{maxPerInvestor} lots</p>
          </div>
        </div>

        {status === "voting" && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Voting ends</span>
              <span className="text-sm font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatRemainingTime(votingEndsAt)}
              </span>
            </div>
          </div>
        )}

        {status === "marketplace" && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Funding progress</span>
              <span className="text-sm font-medium">{fundingProgress}%</span>
            </div>
            <Progress value={fundingProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {soldLots} of {totalLots} lots sold
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
        <Link href={`/dao/proposals/${id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 