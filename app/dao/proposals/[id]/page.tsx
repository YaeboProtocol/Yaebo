"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, DollarSign, PercentIcon, Wallet, Loader2, LogOut, Copy, Check } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { Separator } from "../../../../components/ui/separator";
import { formatCurrency } from "../../../../lib/utils";
import { useCountdown } from "../../../../lib/hooks/useCountdown";
import { getProposalFromSupabase } from "../../../../lib/utils/daoProposals";
import { Proposal } from "../../../../lib/utils/daoUtils";
import { connectWithMetamask, getCurrentAddress, isDaoMember as checkDaoMembership, voteProposal, executeProposal } from "../../../../lib/utils/daoUtils";
import { checkEtherlinkNetwork, switchToEtherlinkNetwork } from "../../../../lib/utils/network";
import { updateProposalExecution } from "../../../../lib/utils/daoProposals";
import VotingInterface from "../../../../components/dao/VotingInterface";
import CommentSection from "../../../../components/dao/CommentSection";
import { toast } from "sonner";
import { Play } from "lucide-react";

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [addressCopied, setAddressCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDaoMember, setIsDaoMember] = useState(false);
  
  // Live countdown timer
  const countdown = useCountdown(proposal?.votingEndsAt || null);
  
  // Fetch proposal data on mount
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const proposalId = parseInt(id);
        
        if (isNaN(proposalId)) {
          console.error("Invalid proposal ID:", id);
          setLoading(false);
          return;
        }
        
        const fetchedProposal = await getProposalFromSupabase(proposalId);
        
        if (fetchedProposal) {
          setProposal(fetchedProposal);
        } else {
          console.error("Proposal not found:", proposalId);
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
        toast.error("Failed to load proposal");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
    
    // Check wallet connection
    const checkWallet = async () => {
      try {
        const address = await getCurrentAddress();
        if (address) {
          setIsConnected(true);
          setWalletAddress(address);
          
          // Check if user is a DAO member
          const memberStatus = await checkDaoMembership(address);
          setIsDaoMember(memberStatus);
          if (!memberStatus) {
            console.log("User is not a DAO member");
          }
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };
    
    checkWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setIsConnected(false);
        setWalletAddress("");
        setUserHasVoted(false);
      } else if (accounts[0] !== walletAddress) {
        // User switched accounts
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setUserHasVoted(false);
      }
    };

    // Listen for chain changes
    const handleChainChanged = () => {
      // Reload page on chain change to ensure correct network
      window.location.reload();
    };

    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [id, walletAddress]);

  const handleConnect = async () => {
    try {
      await connectWithMetamask();
      const address = await getCurrentAddress();
      
      if (address) {
        setIsConnected(true);
        setWalletAddress(address);
        
        // Check if user is a DAO member
        const memberStatus = await checkDaoMembership(address);
        setIsDaoMember(memberStatus);
        if (!memberStatus) {
          toast.warning("You must be a DAO member to vote");
        }
      } else {
        toast.error("Failed to connect wallet");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setUserHasVoted(false);
    toast.info("Wallet disconnected");
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setAddressCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy address");
      }
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle voting on the proposal (maps optionId -> on-chain vote)
  const handleVote = async (optionId: string) => {
    if (!proposal) {
      throw new Error("Proposal not loaded");
    }

    const proposalId = proposal.proposalId;

    // Map option ID to vote value: 0 = yay, 1 = nay
    const voteValue: 0 | 1 = optionId === "yay" ? 0 : 1;

    try {
      // Ensure wallet is connected
      let address = await getCurrentAddress();
      if (!address) {
        await connectWithMetamask();
        address = await getCurrentAddress();
        if (!address) {
          throw new Error("Wallet not connected");
        }
      }

      const onEtherlink = await checkEtherlinkNetwork();
      if (!onEtherlink) {
        toast.info("Please switch to Etherlink Shadownet network");
        try {
          await switchToEtherlinkNetwork();
          toast.success("Switched to Etherlink Shadownet network");
        } catch (e) {
          throw new Error("Please switch to Etherlink Shadownet network in your wallet to vote");
        }
      }

      // Ensure user is a DAO member (with detailed logging)
      console.log("Checking DAO membership for address:", address);
      const isMember = await checkDaoMembership(address);
      console.log("DAO membership status:", isMember);
      
      if (!isMember) {
        throw new Error(
          `You must be a DAO member to vote on proposals. ` +
          `Address ${address} is not registered as a DAO member. ` +
          `Please join the DAO first at /dao`
        );
      }

      // Log voting attempt details
      console.log("Attempting to vote:", {
        proposalId,
        vote: voteValue === 0 ? "yay" : "nay",
        address,
        proposalDeadline: proposal.deadline,
        currentTimestamp: Math.floor(Date.now() / 1000),
      });

      // Call on-chain voteProposal (0 = yay, 1 = nay)
      const tx = await voteProposal(proposalId, voteValue);
      toast.success("Transaction submitted! Waiting for confirmation...");

      await tx.wait();
      toast.success("Vote submitted successfully");

      // Mark that the user has voted so UI updates
      setUserHasVoted(true);
    } catch (error: any) {
      console.error("Failed to submit vote:", error);
      const message =
        error?.reason ||
        error?.message ||
        "Failed to submit vote. Please try again.";
      toast.error(message);
      throw error; // rethrow so VotingInterface can show error state
    }
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

  const handleExecuteProposal = async () => {
    if (!proposal) {
      toast.error("Proposal not loaded");
      return;
    }

    try {
      setIsExecuting(true);

      // Ensure wallet is connected
      let address = await getCurrentAddress();
      if (!address) {
        await connectWithMetamask();
        address = await getCurrentAddress();
        if (!address) {
          throw new Error("Wallet not connected");
        }
      }

      const onEtherlink = await checkEtherlinkNetwork();
      if (!onEtherlink) {
        toast.info("Please switch to Etherlink Shadownet network");
        try {
          await switchToEtherlinkNetwork();
          toast.success("Switched to Etherlink Shadownet network");
        } catch (e) {
          throw new Error("Please switch to Etherlink Shadownet network in your wallet");
        }
      }

      // Ensure user is a DAO member
      const isMember = await checkDaoMembership(address);
      if (!isMember) {
        throw new Error("You must be a DAO member to execute proposals");
      }

      // Check if proposal is already executed
      if (proposal.executed) {
        toast.error("Proposal has already been executed");
        setIsExecuting(false);
        return;
      }

      // Removed deadline check for demo purposes

      toast.info("Executing proposal on-chain...");

      // Execute proposal on-chain
      const tx = await executeProposal(proposal.proposalId);
      toast.success("Transaction submitted! Waiting for confirmation...");

      // Wait for transaction confirmation
      await tx.wait();
      toast.success("Proposal executed successfully on-chain!");

      // Update proposal status in Supabase
      const updateSuccess = await updateProposalExecution(proposal.proposalId, true);
      
      if (updateSuccess) {
        toast.success("Proposal status updated in registry");
        
        // Refresh proposal data
        const updatedProposal = await getProposalFromSupabase(proposal.proposalId);
        if (updatedProposal) {
          setProposal(updatedProposal);
        }
      } else {
        toast.warning("Proposal executed on-chain but failed to update database. Please refresh the page.");
      }
    } catch (error: any) {
      console.error("Failed to execute proposal:", error);
      const message =
        error?.reason ||
        error?.message ||
        "Failed to execute proposal. Please try again.";
      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  };

  // Show loading state
  if (loading) {
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading proposal...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not found if proposal doesn't exist
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

  // Transform proposal data to match UI component expectations
  const proposalData = {
    id: proposal.id,
    title: proposal.proposalSummary.substring(0, 50) + (proposal.proposalSummary.length > 50 ? '...' : ''),
    summary: proposal.proposalSummary,
    fundingAmount: proposal.lotSize * proposal.sharePrice * proposal.maxPerInvestor,
    profitShare: 0, // Not available in contract
    lotSize: proposal.lotSize,
    lotPrice: proposal.sharePrice,
    maxPerInvestor: proposal.maxPerInvestor,
    investmentPeriod: 0, // Not available in contract
    status: proposal.status,
    votingEndsAt: proposal.votingEndsAt,
    createdAt: proposal.createdAt,
    totalLots: Math.floor((proposal.lotSize * proposal.sharePrice * proposal.maxPerInvestor) / proposal.sharePrice),
    soldLots: 0, // Not tracked in contract
  };

  const fundingProgress = proposalData.totalLots ? Math.round((proposalData.soldLots / proposalData.totalLots) * 100) : 0;

  // Build voting options (Yes / No) for the VotingInterface
  const totalVotes = (proposal.yayVotes || 0) + (proposal.nayVotes || 0) || 1;
  const yayPercentage = Math.round(((proposal.yayVotes || 0) / totalVotes) * 100);
  const nayPercentage = Math.round(((proposal.nayVotes || 0) / totalVotes) * 100);

  const votingOptions = [
    {
      id: "yay",
      lotSize: proposal.lotSize,
      sharePrice: proposal.sharePrice,
      maxPerInvestor: proposal.maxPerInvestor,
      voteCount: proposal.yayVotes || 0,
      percentage: yayPercentage,
    },
    {
      id: "nay",
      lotSize: proposal.lotSize,
      sharePrice: proposal.sharePrice,
      maxPerInvestor: proposal.maxPerInvestor,
      voteCount: proposal.nayVotes || 0,
      percentage: nayPercentage,
    },
  ];

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
                  <h1 className="text-3xl font-bold text-gray-900">{proposalData.title}</h1>
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
                      <span className="font-medium">{countdown}</span>
                    </>
                  )}
                </div>
              </div>

              {!isConnected ? (
                <Button onClick={handleConnect} className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 font-mono">
                      {formatAddress(walletAddress)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 p-1 hover:bg-blue-100 rounded transition-colors"
                      title="Copy address"
                    >
                      {addressCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </button>
                  </div>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              )}
            </div>

            <Card className="mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Proposal Summary</CardTitle>
                    <CardDescription>Details about this investment opportunity</CardDescription>
                  </div>
                  {!proposal.executed && isConnected && isDaoMember && (
                    <Button
                      onClick={handleExecuteProposal}
                      disabled={isExecuting}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isExecuting ? "Executing..." : "Execute Proposal"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6">{proposal.proposalSummary}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Funding Amount</h3>
                    <div className="text-lg font-semibold flex items-center">
                      <DollarSign className="h-5 w-5 text-primary mr-1" />
                      {formatCurrency(proposal.lotSize * proposal.sharePrice * proposal.maxPerInvestor)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Votes</h3>
                    <div className="text-lg font-semibold">
                      {proposal.yayVotes} Yes / {proposal.nayVotes} No
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Creator</h3>
                    <div className="text-lg font-semibold font-mono text-xs truncate">
                      {proposal.user.substring(0, 6)}...{proposal.user.substring(proposal.user.length - 4)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Lot Size</h3>
                    <div className="text-lg font-semibold">
                      {formatCurrency(proposal.lotSize)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Share Price</h3>
                    <div className="text-lg font-semibold">
                      {formatCurrency(proposal.sharePrice)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Max Per Investor</h3>
                    <div className="text-lg font-semibold">
                      {proposal.maxPerInvestor} lots
                    </div>
                  </div>
                </div>

                {proposal.status === "voting" && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-blue-900 mb-1">Voting Status</h3>
                        <p className="text-sm text-blue-700">
                          Yes: {proposal.yayVotes} votes | No: {proposal.nayVotes} votes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-900">Ends: {countdown}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {proposal.status === "voting" && (
              <div className="mb-8">
                <VotingInterface
                  //@ts-ignore
                  proposal={proposalData}
                  //@ts-ignore - using on-chain voting, local options derived from proposal
                  options={votingOptions}
                  userHasVoted={userHasVoted}
                  isConnected={isConnected}
                  //@ts-ignore
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