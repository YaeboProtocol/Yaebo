"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProposalCard from "@/components/dao/ProposalCard";
import { ArrowLeft, PlusCircle, Search, Wallet, BarChart, Users, VoteIcon, Briefcase, Loader2, AlertCircle } from "lucide-react";
import { connectWithMetamask, initializeProvider, isDaoMember, getCurrentAddress, joinDao, getAllProposals, Proposal } from "@/lib/utils/daoUtils";
import { checkEtherlinkNetwork, switchToEtherlinkNetwork } from "@/lib/utils/network";
import { getDaoMembership, setDaoMembership } from "@/lib/utils/daoMembership";
import { toast } from "sonner";

// Define the status type to fix TypeScript error
type ProposalStatus = "voting" | "closed" | "marketplace";

export default function DAOPage() {
  const router = useRouter();
  const justJoinedRef = useRef(false); // Track if user just joined to prevent state reset
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | ProposalStatus>("all");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [joiningDao, setJoiningDao] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  // Filter proposals based on search query and active tab
  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch = proposal.proposalSummary.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return proposal.status === activeTab && matchesSearch;
  });

  // Count proposals by status
  const proposalCounts = {
    total: proposals.length,
    voting: proposals.filter(p => p.status === "voting").length,
    closed: proposals.filter(p => p.status === "closed").length,
    marketplace: proposals.filter(p => p.status === "marketplace").length
  };

  // Fetch proposals from Supabase (contract struct can't be read directly)
  const fetchProposals = async () => {
    setLoadingProposals(true);
    try {
      // getAllProposals now reads from Supabase first, then falls back to events
      const fetchedProposals = await getAllProposals();
      setProposals(fetchedProposals);
      console.log("Fetched proposals:", fetchedProposals);
      
      if (fetchedProposals.length === 0) {
        console.log("No proposals found in Supabase. Proposals will appear after they are created.");
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to fetch proposals. Please try again.");
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleConnect = async () => {
    try {
      setCheckingMembership(true);
      
      const isOnEtherlink = await checkEtherlinkNetwork();
      if (!isOnEtherlink) {
        toast.info("Please switch to Etherlink Shadownet network");
        try {
          await switchToEtherlinkNetwork();
          toast.success("Switched to Etherlink Shadownet network");
        } catch (switchError) {
          toast.error("Please manually switch to Etherlink Shadownet network in MetaMask");
          setCheckingMembership(false);
          setLoading(false);
          return;
        }
      }
      
      await connectWithMetamask();
      const address = await getCurrentAddress();
      
      if (address) {
        setIsConnected(true);
        setWalletAddress(address);
        
        // Check if user is a DAO member (with error handling)
        try {
          const memberStatus = await isDaoMember(address);
          setIsMember(memberStatus);
        } catch (error) {
          console.error("Error checking membership:", error);
          // If membership check fails, assume not a member
          setIsMember(false);
          toast.warning("Could not verify DAO membership. You may need to join the DAO.");
        }
      } else {
        toast.error("Failed to connect wallet");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet");
    } finally {
      setCheckingMembership(false);
      setLoading(false);
    }
  };

  const handleJoinDao = async () => {
    let address: string | null = null;
    try {
      setJoiningDao(true);
      
      // Double-check membership before attempting to join
      address = await getCurrentAddress();
      if (address) {
        const currentMemberStatus = await isDaoMember(address);
        if (currentMemberStatus) {
          // User is already a member, update state and return
          setIsMember(true);
          await setDaoMembership(address, true);
          toast.info("You are already a member of the DAO");
          setJoiningDao(false);
          return;
        }
      }
      
      const tx = await joinDao("0.1"); // Join with 0.1 ETH membership fee
      
      toast.success("Transaction submitted! Waiting for confirmation...");
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
      toast.success("Transaction confirmed! Verifying membership...");
      
      // Get address again in case it wasn't set earlier
      if (!address) {
        address = await getCurrentAddress();
      }
      
      // Wait for blockchain state to update, then verify membership with retries
      if (address) {
        let memberStatus = false;
        let retries = 10; // More retries to ensure we catch the state update
        let verified = false;
        
        // Retry membership check with increasing delays
        while (!verified && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
          
          try {
            memberStatus = await isDaoMember(address);
            console.log(`Membership verification attempt ${11 - retries}:`, memberStatus);
            
            if (memberStatus === true) {
              verified = true;
              justJoinedRef.current = true; // Set flag to prevent useEffect from resetting
              setIsMember(true);
              // Store membership in Supabase
              if (address) {
                await setDaoMembership(address, true);
              }
              toast.success("Successfully joined the DAO!");
              console.log("Membership verified successfully");
              break;
            }
          } catch (error) {
            console.error(`Error verifying membership (attempt ${11 - retries}):`, error);
          }
          
          retries--;
        }
        
        if (!verified) {
          // Even if verification fails after retries, if transaction succeeded, assume membership
          console.warn("Membership verification failed after retries, but transaction was successful. Assuming membership.");
          justJoinedRef.current = true; // Set flag to prevent useEffect from resetting
          setIsMember(true);
          // Store membership in Supabase
          if (address) {
            await setDaoMembership(address, true);
          }
          toast.success("Successfully joined the DAO! (Membership verification pending)");
        }
      } else {
        // If no address, still set member to true since transaction succeeded
        justJoinedRef.current = true; // Set flag to prevent useEffect from resetting
        setIsMember(true);
        toast.success("Successfully joined the DAO!");
      }
    } catch (error) {
      console.error("Failed to join DAO:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to join DAO";
      
      // If error is about already being a member, update state
      if (errorMessage.includes("already a member")) {
        setIsMember(true);
        if (address) {
          await setDaoMembership(address, true);
        }
        toast.info("You are already a member of the DAO");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setJoiningDao(false);
    }
  };

  // Transform contract proposals to match ProposalCard format
  const transformProposals = (contractProposals: Proposal[]) => {
    return contractProposals.map((p) => ({
      id: p.id,
      title: p.proposalSummary.substring(0, 50) + (p.proposalSummary.length > 50 ? '...' : ''),
      summary: p.proposalSummary,
      fundingAmount: p.lotSize * p.sharePrice * (p.maxPerInvestor || 1), // Estimate
      profitShare: 0, // Not in contract, default to 0
      lotSize: p.lotSize,
      lotPrice: p.sharePrice, // Using sharePrice as lotPrice
      maxPerInvestor: p.maxPerInvestor,
      status: p.status,
      votingEndsAt: p.votingEndsAt,
      createdAt: p.createdAt,
      totalLots: Math.floor((p.lotSize * p.sharePrice * (p.maxPerInvestor || 1)) / p.sharePrice), // Estimate
      soldLots: 0, // Not tracked in contract
    }));
  };

  useEffect(() => {
    const checkWalletAndMembership = async () => {
      try {
        setLoading(true);
        // Check if wallet is already connected
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const isOnEtherlink = await checkEtherlinkNetwork();
            if (!isOnEtherlink) {
              console.warn("Not on Etherlink Shadownet network");
              setLoading(false);
              return;
            }
            
            // Use initializeProvider instead of connectWithMetamask to avoid popup
            await initializeProvider();
            const address = await getCurrentAddress();
            
            if (address) {
              setIsConnected(true);
              setWalletAddress(address);
              
              // Only check membership if user didn't just join (to prevent state reset)
              if (!justJoinedRef.current) {
                // First check Supabase for cached membership status
                const cachedMembership = await getDaoMembership(address);
                if (cachedMembership) {
                  console.log("Found cached membership in Supabase, verifying with contract...");
                  setIsMember(true); // Set optimistically
                }
                
                // Check membership status from contract (with error handling and retries)
                let memberStatus = cachedMembership; // Start with cached value
                let retries = 3;
                
                while (retries > 0) {
                  try {
                    const contractStatus = await isDaoMember(address);
                    console.log("Membership check result from contract:", contractStatus);
                    memberStatus = contractStatus;
                    
                    // Update Supabase with contract result
                    await setDaoMembership(address, contractStatus);
                    setIsMember(contractStatus);
                    break; // Success, exit retry loop
                  } catch (error) {
                    console.error(`Error checking membership (${4 - retries}/3):`, error);
                    retries--;
                    if (retries > 0) {
                      // Wait before retry
                      await new Promise(resolve => setTimeout(resolve, 1000));
              } else {
                // Final attempt failed
                // If we have cached membership, keep it; otherwise assume not a member
                if (!cachedMembership && !justJoinedRef.current) {
                  setIsMember(false);
                  if (address) {
                    await setDaoMembership(address, false);
                  }
                }
              }
                  }
                }
              } else {
                // User just joined, skip the check and reset the flag
                console.log("User just joined, skipping membership check to preserve state");
                justJoinedRef.current = false;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      } finally {
        setLoading(false);
      }
    };

    checkWalletAndMembership();
    
    // Fetch proposals on mount
    fetchProposals();

    // Listen for account changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setIsConnected(false);
          setWalletAddress("");
          setIsMember(false);
          justJoinedRef.current = false; // Reset flag
        } else {
          // Account changed, re-check membership (but respect justJoined flag)
          const address = await getCurrentAddress();
          if (address) {
            setWalletAddress(address);
            if (!justJoinedRef.current) {
              try {
                // Check Supabase first
                const cachedMembership = await getDaoMembership(address);
                if (cachedMembership) {
                  setIsMember(true);
                }
                
                // Then verify with contract
                const memberStatus = await isDaoMember(address);
                setIsMember(memberStatus);
                await setDaoMembership(address, memberStatus);
              } catch (error) {
                console.error("Error checking membership after account change:", error);
                // Use cached value if available
                const cachedMembership = await getDaoMembership(address);
                setIsMember(cachedMembership);
              }
            } else {
              // Just joined, don't reset membership status
              justJoinedRef.current = false;
            }
          }
        }
      };

      const handleChainChanged = () => {
        // Reload page when chain changes to ensure correct network
        window.location.reload();
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        if ((window as any).ethereum) {
          (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
          (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show connect wallet prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription className="text-base mt-2">
                Please connect your wallet to access the DAO
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={handleConnect} 
                size="lg" 
                className="gap-2"
                disabled={checkingMembership}
              >
                {checkingMembership ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show join DAO prompt if connected but not a member
  // Double-check: if isMember is true, we should never show this
  if (isConnected && !isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <div className="flex items-center px-3 py-2 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
              <Wallet className="h-4 w-4 mr-2" />
              <span className="hidden md:inline mr-2">Connected:</span>
              <span className="font-mono">{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
            </div>
          </div>

          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Join the DAO</CardTitle>
              <CardDescription className="text-base mt-2">
                You need to be a DAO member to access proposals and vote
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                As a DAO member, you can:
              </p>
              <ul className="text-sm text-left space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Vote on investment proposals
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Create new proposals
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Participate in governance decisions
                </li>
              </ul>
              <Button 
                onClick={handleJoinDao} 
                size="lg" 
                className="gap-2 mt-6"
                disabled={joiningDao}
              >
                {joiningDao ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining DAO...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Join DAO
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will require a transaction confirmation in your wallet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show DAO content if user is a member
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
          <div className="flex items-center px-3 py-2 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
            <Wallet className="h-4 w-4 mr-2" />
            <span className="hidden md:inline mr-2">Connected:</span>
            <span className="font-mono">{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DAO Proposals</h1>
          <p className="mt-2 text-gray-500">
            Vote on investment proposals and shape the future of the protocol.
          </p>
        </div>

        {/* Quick stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Proposals
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Voting
              </CardTitle>
              <VoteIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.voting}</div>
              <p className="text-xs text-muted-foreground">
                Proposals awaiting DAO votes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Marketplace Listings
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.marketplace}</div>
              <p className="text-xs text-muted-foreground">
                Open for investment
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Closed Proposals
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposalCounts.closed}</div>
              <p className="text-xs text-muted-foreground">
                Historical voting results
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Proposal Directory</CardTitle>
            <Link href={isConnected ? "/dao/proposals/new" : "#"} onClick={e => !isConnected && e.preventDefault()}>
              <Button 
                variant="default" 
                size="sm" 
                  className="gap-2 w-full md:w-auto"
                disabled={!isConnected}
              >
                <PlusCircle className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
          </div>
            <CardDescription>Browse and vote on active investment proposals</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as typeof activeTab)} 
                className="w-full md:w-auto"
              >
              <TabsList className="grid grid-cols-4 md:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="voting">Voting</TabsTrigger>
                  <TabsTrigger value="marketplace">Market</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loadingProposals ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading proposals...</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-md border">
              <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-800 mb-1">No proposals found</p>
              <p className="text-gray-500 mb-4">
                {proposals.length === 0 
                  ? "No proposals have been created yet." 
                  : "No proposals match your current filters"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transformProposals(filteredProposals).map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 