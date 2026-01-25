"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, DollarSign, PercentIcon, Wallet } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { Separator } from "../../../../components/ui/separator";
import { mockProposals, mockVotes, mockComments } from "../../../../lib/mock-data";
import { connectWallet, formatCurrency, formatRemainingTime } from "../../../../lib/utils";
import VotingInterface from "../../../../components/dao/VotingInterface";
import CommentSection from "../../../../components/dao/CommentSection";

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [comments, setComments] = useState(mockComments.filter(comment => comment.proposalId === id));
  
  // Find the proposal by id
  const proposal = mockProposals.find((p) => p.id === id);
  const votes = mockVotes.filter((vote) => vote.proposalId === id);

  const handleConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.connected) {
        setIsConnected(true);
        setWalletAddress(result.address);
        // Check if user has voted
        setUserHasVoted(votes.some(vote => vote.userId === "1")); // Mocked user ID
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleVote = async (vote: { lotSize: number; sharePrice: number; maxPerInvestor: number }) => {
    // In a real app, this would call an API to submit the vote
    console.log("Vote submitted:", vote);
    
    // For demo, just add to votes and set user has voted
    const newVote = {
      id: `vote-${id}-${Date.now()}`,
      proposalId: id,
      userId: "1", // Mocked user ID
      ...vote,
      createdAt: new Date(),
    };
    
    // In a real app, this would update the database
    // For now, just update the local state
    setUserHasVoted(true);
    
    return Promise.resolve();
  };

  const handleAddComment = async (content: string, attachments: string[]) => {
    // In a real app, this would call an API to add the comment
    console.log("Comment added:", content, attachments);
    
    // For demo, just add to comments
    const newComment = {
      id: `comment-${id}-${Date.now()}`,
      proposalId: id,
      userId: "1", // Mocked user ID
      userName: "DAO Member 1", // Mocked user name
      content,
      attachments,
      createdAt: new Date(),
    };
    
    // In a real app, this would update the database
    // For now, just update the local state
    setComments([...comments, newComment]);
    
    return Promise.resolve();
  };

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dao"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Proposals
            </Link>
          </div>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h1>
            <p className="text-gray-500">The proposal you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

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

  const fundingProgress = proposal.totalLots ? Math.round((proposal.soldLots / proposal.totalLots) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dao"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Proposals
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-grow">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Created {new Date(proposal.createdAt).toLocaleDateString()}</span>
                  {proposal.status === "voting" && (
                    <>
                      <span className="mx-2">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{formatRemainingTime(proposal.votingEndsAt)}</span>
                    </>
                  )}
                </div>
              </div>

              {!isConnected && (
                <Button onClick={handleConnect} className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>

            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle>Proposal Summary</CardTitle>
                <CardDescription>Details about this investment opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">{proposal.summary}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Funding Amount</h3>
                    <div className="text-lg font-semibold flex items-center">
                      <DollarSign className="h-5 w-5 text-primary mr-1" />
                      {formatCurrency(proposal.fundingAmount)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Profit Share</h3>
                    <div className="text-lg font-semibold flex items-center">
                      <PercentIcon className="h-5 w-5 text-primary mr-1" />
                      {proposal.profitShare}%
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Investment Period</h3>
                    <div className="text-lg font-semibold">
                      {proposal.investmentPeriod} months
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Lot Size</h3>
                    <div className="text-lg font-semibold">
                      {formatCurrency(proposal.lotSize)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Lot Price</h3>
                    <div className="text-lg font-semibold">
                      {formatCurrency(proposal.lotPrice)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Max Per Investor</h3>
                    <div className="text-lg font-semibold">
                      {proposal.maxPerInvestor} lots
                    </div>
                  </div>
                </div>

                {proposal.status === "marketplace" && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Funding Progress</h3>
                    <Progress value={fundingProgress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm">
                      <span>{proposal.soldLots} of {proposal.totalLots} lots sold</span>
                      <span>{fundingProgress}% funded</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {proposal.status === "voting" && (
              <div className="mb-8">
                <VotingInterface
                  proposal={proposal}
                  votes={votes}
                  userHasVoted={userHasVoted}
                  isConnected={isConnected}
                  onVote={handleVote}
                  connectWallet={handleConnect}
                />
              </div>
            )}

            <CommentSection
              proposalId={id}
              comments={comments}
              isConnected={isConnected}
              onAddComment={handleAddComment}
              connectWallet={handleConnect}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 