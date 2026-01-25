"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle2, Clock, AlertCircle, Coins, Users, PieChart, DollarSign, Package, Info, Check, Loader } from "lucide-react";
import { formatRemainingTime } from "../../lib/utils";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../ui/label";
import { useSorobanReact } from "@soroban-react/core";

// Mock toast implementation if sonner isn't installed
const toast = {
  success: (title: string, options?: { description: string }) => {
    console.log(`Success: ${title}`, options?.description);
  },
  error: (title: string, options?: { description: string }) => {
    console.log(`Error: ${title}`, options?.description);
  }
};

interface PoolOption {
  id: string;
  lotSize: number;
  sharePrice: number;
  maxPerInvestor: number;
  voteCount: number;
  percentage: number;
}

interface VotingInterfaceProps {
  proposal?: {
    id: string;
    votingEndsAt: Date;
    title: string;
    description: string;
  };
  options?: PoolOption[];
  userSelection?: string | null;
  isConnected?: boolean;
  onVote?: (optionId: string) => Promise<void>;
  connectWallet?: () => Promise<void>;
}

export default function VotingInterface({
  proposal = {
    id: "mock-proposal-1",
    title: "Investment Pool Parameters",
    description: "Vote on the parameters for the upcoming funding round for SME Manufacturing Ltd.",
    votingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  options = [
    {
      id: "option-1",
      lotSize: 10000,
      sharePrice: 100,
      maxPerInvestor: 1000,
      voteCount: 24,
      percentage: 48,
    },
    {
      id: "option-2",
      lotSize: 5000,
      sharePrice: 200,
      maxPerInvestor: 500,
      voteCount: 18,
      percentage: 36,
    },
    {
      id: "option-3",
      lotSize: 20000,
      sharePrice: 50,
      maxPerInvestor: 2000,
      voteCount: 8,
      percentage: 16,
    },
  ],
  userSelection = null,
  isConnected = true,
  onVote = async (optionId) => {
    console.log("Voted for option:", optionId);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },
  connectWallet = async () => {
    console.log("Connecting wallet...");
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },
}: Partial<VotingInterfaceProps>) {
  const [selectedOption, setSelectedOption] = useState<string | null>(userSelection);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionState, setTransactionState] = useState<'pending' | 'success' | 'error'>('pending');
  
  // Get Soroban context for wallet integration
  const sorobanContext = useSorobanReact();
  const { address, activeConnector, setActiveConnectorAndConnect } = sorobanContext;
  
  // For demo: override isConnected based on Soroban wallet connection
  const walletConnected = !!address;
  const effectiveConnected = isConnected || walletConnected;
  
  // For demo: override userSelection with local state if user has voted
  const effectiveUserSelection = hasVoted ? selectedOption : userSelection;

  // Attempt to connect wallet on mount
  useEffect(() => {
    if (!effectiveConnected && sorobanContext.connectors?.length > 0) {
      connectFreighter();
    }
  }, []);
  
  // Connect Freighter wallet
  const connectFreighter = async () => {
    if (sorobanContext.connectors?.length > 0 && setActiveConnectorAndConnect) {
      try {
        await setActiveConnectorAndConnect(sorobanContext.connectors[0]);
        return true;
      } catch (err) {
        console.error("Failed to connect wallet:", err);
        return false;
      }
    }
    return false;
  };

  const votingEnded = new Date() > proposal.votingEndsAt;
  const totalVotes = options?.reduce((sum, option) => sum + option.voteCount, 0) || 0;
  
  const sortedOptions = options ? [...options].sort((a, b) => b.voteCount - a.voteCount) : [];

  const mockTransactionProcess = async () => {
    setShowTransactionModal(true);
    setTransactionState('pending');
    
    // Simulate transaction processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% chance of success for demo purposes
    const success = Math.random() > 0.1;
    
    if (success) {
      setTransactionState('success');
      // Display success toast
      if (typeof window !== 'undefined') {
        toast.success("Transaction successful", {
          description: "Your vote has been recorded on the blockchain."
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowTransactionModal(false);
      return true;
    } else {
      setTransactionState('error');
      // Display error toast
      if (typeof window !== 'undefined') {
        toast.error("Transaction failed", {
          description: "There was an error processing your transaction. Please try again."
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowTransactionModal(false);
      throw new Error("Transaction failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedOption) {
      setError("Please select an option");
      return;
    }

    // Ensure wallet is connected
    if (!address) {
      const connected = await connectFreighter();
      if (!connected) {
        setError("Please connect your wallet to vote");
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // First process the mock transaction
      await mockTransactionProcess();
      
      // Then call the onVote callback
      await onVote(selectedOption);
      
      // Update local state to reflect vote
      setHasVoted(true);
      
      // For demo: Update the local options to show updated vote counts
      setLocalOptions(prevOptions => {
        return prevOptions.map(option => {
          if (option.id === selectedOption) {
            const newVoteCount = option.voteCount + 1;
            const newTotal = totalVotes + 1;
            
            // Recalculate percentages for all options
            return {
              ...option,
              voteCount: newVoteCount,
              percentage: Math.round((newVoteCount / newTotal) * 100)
            };
          } else {
            // Adjust percentage for other options
            const newTotal = totalVotes + 1;
            return {
              ...option,
              percentage: Math.round((option.voteCount / newTotal) * 100)
            };
          }
        });
      });
      
    } catch (err) {
      setError("Failed to submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Renders a single poll option with its investment parameters
  const PoolOptionCard = ({ 
    option, 
    index, 
    selected = false, 
    showResults = false, 
    onClick = undefined,
    showCheckmark = false 
  }: { 
    option: PoolOption; 
    index: number; 
    selected?: boolean; 
    showResults?: boolean;
    onClick?: () => void;
    showCheckmark?: boolean;
  }) => {
    const totalValue = option.lotSize * option.sharePrice;
    const maxInvestment = option.maxPerInvestor * option.sharePrice;
    const isTopVoted = index === 0 && option.voteCount > 0;
    
    return (
      <div 
        className={cn(
          "relative border rounded-lg p-4 transition-all",
          selected ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300",
          showResults && isTopVoted ? "bg-blue-50" : "",
          onClick ? "cursor-pointer" : ""
        )}
        onClick={onClick}
      >
        {showCheckmark && selected && (
          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
        
        {showResults && isTopVoted && (
          <Badge className="absolute -top-2 -left-2 bg-blue-500">
            Leading
          </Badge>
        )}
        
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 flex items-center">
              <Package className="h-3 w-3 mr-1" /> Lot Size
            </span>
            <span className="font-bold">{option.lotSize.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" /> Share Price
            </span>
            <span className="font-bold">${option.sharePrice.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 flex items-center">
              <Users className="h-3 w-3 mr-1" /> Max/Investor
            </span>
            <span className="font-bold">{option.maxPerInvestor.toLocaleString()}</span>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Total Pool Value</span>
            <span className="font-semibold text-green-600">${totalValue.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Max Investment</span>
            <span className="font-semibold text-blue-600">${maxInvestment.toLocaleString()}</span>
          </div>
        </div>
        
        {showResults && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{option.percentage}%</span>
              <span className="text-xs text-muted-foreground">{option.voteCount} votes</span>
            </div>
            <Progress 
              value={option.percentage} 
              className="h-2.5" 
              color={isTopVoted ? "bg-blue-500" : "bg-slate-300"} 
            />
          </div>
        )}
      </div>
    );
  };

  // Render transaction modal
  const TransactionModal = () => {
    if (!showTransactionModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <div className="flex flex-col items-center">
            {transactionState === 'pending' && (
              <>
                <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-bold mb-2">Processing Transaction</h3>
                <p className="text-center text-muted-foreground">
                  Please wait while your vote is being recorded on the blockchain...
                </p>
              </>
            )}
            
            {transactionState === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Transaction Successful</h3>
                <p className="text-center text-muted-foreground">
                  Your vote has been successfully recorded on the blockchain.
                </p>
              </>
            )}
            
            {transactionState === 'error' && (
              <>
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Transaction Failed</h3>
                <p className="text-center text-muted-foreground">
                  There was an error processing your transaction. Please try again.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // When voting has ended, show results
  if (votingEnded) {
    return (
      <Card className="shadow-md border-slate-200">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center text-xl">
            <Clock className="mr-2 h-5 w-5 text-amber-500" />
            Voting Closed
          </CardTitle>
          <CardDescription>
            Final results for "{proposal.title}"
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              Voting has ended. The leading option will be implemented.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedOptions.map((option, index) => (
              <PoolOptionCard 
                key={option.id} 
                option={option} 
                index={index} 
                selected={option.id === userSelection}
                showResults={true}
                showCheckmark={option.id === userSelection}
              />
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold mb-2">Final Investment Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Lot Size:</span>
                <div className="font-bold">{sortedOptions[0]?.lotSize.toLocaleString() || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Share Price:</span>
                <div className="font-bold">${sortedOptions[0]?.sharePrice.toLocaleString() || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Max Per Investor:</span>
                <div className="font-bold">{sortedOptions[0]?.maxPerInvestor.toLocaleString() || 'N/A'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // When user has already voted, show their selection and current results
  if (effectiveUserSelection) {
    return (
      <>
        <TransactionModal />
        <Card className="shadow-md border-slate-200">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center text-xl">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Vote Submitted
            </CardTitle>
            <CardDescription>
              Current results for "{proposal.title}"
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Your vote has been recorded. Current results are shown below.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              <p className="text-sm text-muted-foreground">{proposal.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(hasVoted ? localOptions : sortedOptions).sort((a, b) => b.voteCount - a.voteCount).map((option, index) => (
                <PoolOptionCard 
                  key={option.id} 
                  option={option} 
                  index={index} 
                  selected={option.id === effectiveUserSelection}
                  showResults={true}
                  showCheckmark={option.id === effectiveUserSelection}
                />
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Clock className="mr-2 h-4 w-4 text-amber-500" />
              <span className="font-medium">{formatRemainingTime(proposal.votingEndsAt)}</span>
              <span className="ml-2 text-sm text-muted-foreground">until voting ends</span>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // If not connected, prompt to connect
  if (!effectiveConnected) {
    return (
      <>
        <TransactionModal />
        <Card className="shadow-md border-slate-200">
          <CardHeader className="text-center pb-2">
            <CardTitle>Connect Wallet to Vote</CardTitle>
            <CardDescription>
              Participating in governance requires a connected wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Coins className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mb-6 text-center text-muted-foreground max-w-md">
                To vote on the investment pool parameters, please connect your wallet first. 
                Your vote power is determined by your token holdings.
              </p>
              <Button onClick={connectFreighter} size="lg" className="px-8">
                Connect Freighter Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Default case: allow voting with radio selection
  return (
    <>
      <TransactionModal />
      <Card className="shadow-md border-slate-200">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center text-xl">
            <PieChart className="mr-2 h-5 w-5 text-primary" />
            Cast Your Vote
          </CardTitle>
          <CardDescription>
            {proposal.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <RadioGroup 
              value={selectedOption || ""} 
              onValueChange={setSelectedOption}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            >
              {options.map((option, index) => (
                <div key={option.id} className="relative">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="absolute opacity-0"
                  />
                  <Label htmlFor={option.id} className="cursor-pointer block">
                    <PoolOptionCard 
                      option={option} 
                      index={index} 
                      selected={selectedOption === option.id}
                    />
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-center justify-between">
              <div className="text-sm flex items-center p-2 px-3 bg-amber-50 rounded-full border border-amber-200">
                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                <span className="font-medium">{formatRemainingTime(proposal.votingEndsAt)}</span>
              </div>
              <Button 
                type="submit" 
                disabled={submitting || !selectedOption}
                size="lg"
                className="px-8"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : "Submit Vote"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
} 