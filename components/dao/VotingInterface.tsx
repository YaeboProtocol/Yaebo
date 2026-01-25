"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatRemainingTime, calculateVoteDistribution, VoteOption } from "../../lib/utils";
import { Progress } from "../ui/progress";

interface VotingInterfaceProps {
  proposal: {
    id: string;
    lotSize: number;
    lotPrice: number;
    maxPerInvestor: number;
    votingEndsAt: Date;
  };
  votes: Array<{
    lotSize: number;
    sharePrice: number;
    maxPerInvestor: number;
  }>;
  userHasVoted: boolean;
  isConnected: boolean;
  onVote: (vote: { lotSize: number; sharePrice: number; maxPerInvestor: number }) => void;
  connectWallet: () => Promise<void>;
}

export default function VotingInterface({
  proposal,
  votes,
  userHasVoted,
  isConnected,
  onVote,
  connectWallet,
}: VotingInterfaceProps) {
  const [lotSize, setLotSize] = useState(proposal.lotSize.toString());
  const [sharePrice, setSharePrice] = useState(proposal.lotPrice.toString());
  const [maxPerInvestor, setMaxPerInvestor] = useState(proposal.maxPerInvestor.toString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const votingEnded = new Date() > proposal.votingEndsAt;
  
  // Calculate vote distributions
  const lotSizeVotes = calculateVoteDistribution(votes, 'lotSize');
  const sharePriceVotes = calculateVoteDistribution(votes, 'sharePrice');
  const maxPerInvestorVotes = calculateVoteDistribution(votes, 'maxPerInvestor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!lotSize || !sharePrice || !maxPerInvestor) {
      setError("All fields are required");
      return;
    }

    const lotSizeVal = parseInt(lotSize);
    const sharePriceVal = parseInt(sharePrice);
    const maxPerInvestorVal = parseInt(maxPerInvestor);

    if (isNaN(lotSizeVal) || isNaN(sharePriceVal) || isNaN(maxPerInvestorVal)) {
      setError("All values must be valid numbers");
      return;
    }

    if (lotSizeVal <= 0 || sharePriceVal <= 0 || maxPerInvestorVal <= 0) {
      setError("All values must be greater than zero");
      return;
    }

    try {
      setSubmitting(true);
      await onVote({
        lotSize: lotSizeVal,
        sharePrice: sharePriceVal,
        maxPerInvestor: maxPerInvestorVal,
      });
    } catch (err) {
      setError("Failed to submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render vote distribution
  const renderVoteOptions = (options: VoteOption[]) => {
    return options.map((option, index) => (
      <div key={index} className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm">{option.value.toLocaleString()}</span>
          <span className="text-sm">{option.percentage}%</span>
        </div>
        <Progress value={option.percentage} className="h-2" />
      </div>
    ));
  };

  if (votingEnded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Voting Closed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Voting has ended for this proposal. Results are displayed below.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Lot Size</h3>
              {renderVoteOptions(lotSizeVotes)}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Share Price</h3>
              {renderVoteOptions(sharePriceVotes)}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Max Per Investor</h3>
              {renderVoteOptions(maxPerInvestorVotes)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userHasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            Vote Submitted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Your vote has been successfully submitted. You can see the current results below.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Lot Size</h3>
              {renderVoteOptions(lotSizeVotes)}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Share Price</h3>
              {renderVoteOptions(sharePriceVotes)}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Max Per Investor</h3>
              {renderVoteOptions(maxPerInvestorVotes)}
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {formatRemainingTime(proposal.votingEndsAt)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet to Vote</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            You need to connect your wallet to vote on this proposal.
          </p>
          <Button onClick={connectWallet}>Connect Wallet</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Cast Your Vote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="lotSize" className="mb-2 block">
                Lot Size
              </Label>
              <Input
                id="lotSize"
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="Enter lot size"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="sharePrice" className="mb-2 block">
                Share Price
              </Label>
              <Input
                id="sharePrice"
                type="number"
                value={sharePrice}
                onChange={(e) => setSharePrice(e.target.value)}
                placeholder="Enter share price"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="maxPerInvestor" className="mb-2 block">
                Max Per Investor
              </Label>
              <Input
                id="maxPerInvestor"
                type="number"
                value={maxPerInvestor}
                onChange={(e) => setMaxPerInvestor(e.target.value)}
                placeholder="Enter maximum per investor"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {formatRemainingTime(proposal.votingEndsAt)}
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Vote"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 