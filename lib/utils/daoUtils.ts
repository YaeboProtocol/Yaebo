"use client";

import { ethers, parseUnits, parseEther } from "ethers";
import { daoContractAbi, daoContractAddress } from "@/constants/daoContract";
import { mockedUSDCAbi, mockedUSDCAddress } from "@/constants/mockedUSDC";
import { ETHERLINK_RPC, checkEtherlinkNetwork, switchToEtherlinkNetwork } from "./network";

let signer: ethers.JsonRpcSigner | null = null;
let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;

/**
 * Initialize provider and signer without requesting account access (no popup)
 * Use this when checking if wallet is already connected
 */
export async function initializeProvider() {
  if (typeof window === "undefined" || (window as any).ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    provider = new ethers.JsonRpcProvider(ETHERLINK_RPC);
    console.log("Using read-only provider:", provider);
    signer = null;
    return null;
  } else {
    provider = new ethers.BrowserProvider((window as any).ethereum);
    console.log("Provider initialized:", provider);

    // Check if accounts are already connected FIRST (without prompting)
    // eth_accounts does NOT trigger a popup - it only returns already-connected accounts
    let accounts: string[] = [];
    try {
      accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
    } catch (error) {
      console.warn("Error checking accounts (no popup):", error);
      signer = null;
      return null;
    }

    if (accounts && accounts.length > 0) {
      // Only check network if we have accounts (non-blocking)
      try {
        const isOnEtherlink = await checkEtherlinkNetwork();
        if (!isOnEtherlink) {
          console.warn("Not on Etherlink network. User should switch networks.");
        }
      } catch (error) {
        console.warn("Could not check network:", error);
      }

      // IMPORTANT: Don't call getSigner() here - it might trigger a popup in some cases
      // Only initialize the provider. getSigner() will be called when actually needed
      // (when user explicitly connects or when signing a transaction)
      console.log("Accounts found, provider ready (signer will be initialized when needed)");
      signer = null; // Don't initialize signer here to avoid any potential popup
      return null; // Return null but provider is ready
    } else {
      console.log("No accounts connected - no popup triggered");
      signer = null;
      return null;
    }
  }
}

/**
 * Connect to MetaMask and request account access (will show popup)
 * Use this only when user explicitly clicks "Connect Wallet"
 */
export async function connectWithMetamask() {
  if (typeof window === "undefined" || (window as any).ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    provider = new ethers.JsonRpcProvider(ETHERLINK_RPC);
    console.log("Using read-only provider:", provider);
    return null;
  } else {
    provider = new ethers.BrowserProvider((window as any).ethereum);
    console.log("Provider initialized:", provider);

    const isOnEtherlink = await checkEtherlinkNetwork();
    if (!isOnEtherlink) {
      console.warn("Not on Etherlink network. User should switch networks.");
    }

    // Request account access (this will show popup)
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();
    console.log("Signer initialized:", signer);
    return signer;
  }
}

/**
 * Get the contract instance with signer
 */
function getContract() {
  if (!signer) {
    throw new Error("Signer not initialized. Please connect wallet first.");
  }
  return new ethers.Contract(daoContractAddress, daoContractAbi, signer);
}

/**
 * Get the contract instance for read-only operations
 */
function getReadOnlyContract() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(ETHERLINK_RPC);
  }
  return new ethers.Contract(daoContractAddress, daoContractAbi, provider);
}

/**
 * Join the DAO (payable function)
 * @param amount - Amount in ETH to send when joining (default: 0.1 ETH = 100000000000000000 wei)
 */
export async function joinDao(amount: string = "0.1") {
  await connectWithMetamask();
  const contract = getContract();
  const value = parseEther(amount);
  
  // Check if user is already a member
  const address = await getCurrentAddress();
  if (address) {
    const isMember = await isDaoMember(address);
    if (isMember) {
      throw new Error("You are already a member of the DAO");
    }
  }
  
  try {
    // Estimate gas for the transaction
    const gasEstimate = await contract.join.estimateGas({ value: value });
    
    // Get fee data from provider (includes gas price)
    let gasPrice;
    try {
      const feeData = await provider!.getFeeData();
      // Use provider's gas price or fallback to a reasonable default
      gasPrice = feeData.gasPrice || parseUnits("1", "gwei");
    } catch (feeError) {
      // Fallback to a reasonable gas price if getFeeData fails
      console.warn("Could not get fee data, using default gas price");
      gasPrice = parseUnits("1", "gwei");
    }
    
    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate + (gasEstimate / BigInt(5));
    
    console.log("Gas estimate:", gasEstimate.toString());
    console.log("Gas price:", gasPrice.toString());
    console.log("Gas limit:", gasLimit.toString());
    console.log("Value:", value.toString());
    
    const tx = await contract.join({
      value: value,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
    });
    
    console.log("Join transaction:", tx);
    return tx;
  } catch (error: any) {
    console.error("Error joining DAO:", error);
    
    // Try to extract revert reason if available
    if (error.reason) {
      throw new Error(`Failed to join DAO: ${error.reason}`);
    } else if (error.data) {
      throw new Error(`Failed to join DAO: ${error.data}`);
    } else if (error.message) {
      throw new Error(`Failed to join DAO: ${error.message}`);
    } else {
      throw new Error("Failed to join DAO. Please check your wallet balance and try again.");
    }
  }
}

/**
 * Create a new proposal
 * @param lotSize - Size of each lot
 * @param sharePrice - Price per share
 * @param maxPerInvestor - Maximum lots per investor
 * @param proposalSummary - Summary of the proposal
 */
export async function createProposal(
  lotSize: number,
  sharePrice: number,
  maxPerInvestor: number,
  proposalSummary: string
) {
  await connectWithMetamask();
  const contract = getContract();
  
  try {
    // Estimate gas for the transaction
    const gasEstimate = await contract.createProposal.estimateGas(
      lotSize,
      sharePrice,
      maxPerInvestor,
      proposalSummary
    );
    
    // Get fee data from provider (includes gas price)
    let gasPrice;
    try {
      const feeData = await provider!.getFeeData();
      // Use provider's gas price or fallback to a reasonable default
      gasPrice = feeData.gasPrice || parseUnits("1", "gwei");
    } catch (feeError) {
      // Fallback to a reasonable gas price if getFeeData fails
      console.warn("Could not get fee data, using default gas price");
      gasPrice = parseUnits("1", "gwei");
    }
    
    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate + (gasEstimate / BigInt(5));
    
    console.log("Gas estimate:", gasEstimate.toString());
    console.log("Gas price:", gasPrice.toString());
    console.log("Gas limit:", gasLimit.toString());
    console.log("Proposal params:", { lotSize, sharePrice, maxPerInvestor, proposalSummary });
    
    const tx = await contract.createProposal(
      lotSize,
      sharePrice,
      maxPerInvestor,
      proposalSummary,
      {
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      }
    );
    
    console.log("Create proposal transaction:", tx);
    
    // Wait for transaction to be mined and get the receipt
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
    
    // Get the proposal ID from the transaction receipt or event logs
    let proposalId: number | null = null;
    
    if (receipt.logs) {
      try {
        // Try to parse proposalCreated event
        const iface = contract.interface;
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            if (parsed && parsed.name === 'proposalCreated') {
              proposalId = Number(parsed.args[0] || parsed.args.proposalId || 0);
              break;
            }
          } catch (e) {
            // Skip logs that can't be parsed
          }
        }
      } catch (error) {
        console.error("Error parsing proposal ID from events:", error);
      }
    }
    
    // If we couldn't get the proposal ID from events, use numProposal
    if (!proposalId || proposalId === 0) {
      try {
        const totalProposals = await contract.numProposal();
        proposalId = Number(totalProposals);
      } catch (error) {
        console.error("Error getting proposal ID:", error);
      }
    }
    
    // Store proposal in Supabase if we have the ID
    if (proposalId && proposalId > 0 && receipt.hash) {
      try {
        const address = await getCurrentAddress();
        if (address) {
          // Calculate deadline (7 days from now)
          const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
          
          // Import and call the store function
          const { storeProposalInSupabase } = await import('./daoProposals');
          await storeProposalInSupabase(
            proposalId,
            lotSize,
            sharePrice,
            maxPerInvestor,
            proposalSummary,
            address,
            deadline,
            receipt.hash
          );
          console.log(`Proposal ${proposalId} stored in Supabase`);
        }
      } catch (error) {
        console.error("Error storing proposal in Supabase:", error);
        // Don't fail the transaction if Supabase storage fails
      }
    }
    
    // The proposal ID is returned from the function, but we can also get it from events
    return tx;
  } catch (error: any) {
    console.error("Error creating proposal:", error);
    
    // Try to extract revert reason if available
    if (error.reason) {
      throw new Error(`Failed to create proposal: ${error.reason}`);
    } else if (error.data) {
      throw new Error(`Failed to create proposal: ${error.data}`);
    } else if (error.message) {
      throw new Error(`Failed to create proposal: ${error.message}`);
    } else {
      throw new Error("Failed to create proposal. Please check your wallet and try again.");
    }
  }
}

/**
 * Vote on a proposal
 * @param proposalId - ID of the proposal to vote on
 * @param vote - Vote value: 0 for yay, 1 for nay
 */
export async function voteProposal(proposalId: number, vote: 0 | 1) {
  await connectWithMetamask();
  const contract = getContract();
  const readOnlyContract = getReadOnlyContract();
  const address = await getCurrentAddress();

  if (!address) {
    throw new Error("Wallet not connected");
  }

  try {
    // Step 1: Verify proposal ID exists
    let totalProposals: bigint;
    try {
      totalProposals = await (contract as any).numProposal();
      const maxId = Number(totalProposals);
      if (proposalId < 1 || proposalId > maxId) {
        throw new Error(
          `Invalid proposalId ${proposalId}. On‑chain numProposal is ${maxId}.`
        );
      }
      console.log(`✓ Proposal ID ${proposalId} is valid (max: ${maxId})`);
    } catch (e: any) {
      console.error("Failed to verify proposalId:", e);
      throw new Error(
        e?.reason ||
          e?.message ||
          "Unable to verify proposal ID on-chain. Check that you are connected to the correct network/contract."
      );
    }

    // Step 2: Verify DAO membership
    try {
      const isMember = await isDaoMember(address);
      if (!isMember) {
        throw new Error(
          `Address ${address} is not a DAO member. Please join the DAO first.`
        );
      }
      console.log(`✓ Address ${address} is a DAO member`);
    } catch (e: any) {
      if (e.message?.includes("not a DAO member")) {
        throw e;
      }
      console.error("Failed to verify membership:", e);
      throw new Error(
        `Unable to verify DAO membership: ${e?.message || "Unknown error"}`
      );
    }

    // Step 3: Estimate gas to catch revert reasons early
    let gasEstimate: bigint;
    try {
      gasEstimate = await contract.voteProposal.estimateGas(proposalId, vote);
      console.log(`✓ Gas estimate successful: ${gasEstimate.toString()}`);
    } catch (estimateError: any) {
      console.error("Gas estimate failed (vote would revert):", estimateError);
      
      // Try to extract the revert reason
      const errorMessage = 
        estimateError?.reason ||
        estimateError?.shortMessage ||
        estimateError?.error?.message ||
        estimateError?.data?.message ||
        estimateError?.message ||
        "";

      // Provide specific error messages based on common revert reasons
      if (errorMessage.includes("deadline exceeded") || errorMessage.includes("deadline")) {
        throw new Error("Voting deadline has passed for this proposal.");
      }
      if (errorMessage.includes("already voted") || errorMessage.includes("voted")) {
        throw new Error("You have already voted on this proposal.");
      }
      if (errorMessage.includes("not a member") || errorMessage.includes("onlyMember")) {
        throw new Error("You are not a DAO member. Please join the DAO first.");
      }
      
      // Generic error with diagnostic info
      throw new Error(
        `Vote would fail on-chain. ${errorMessage ? `Reason: ${errorMessage}` : "Possible reasons: deadline passed, already voted, or not a DAO member."}`
      );
    }

    // Step 4: Get current gas price
    let gasPrice;
    try {
      const feeData = await provider!.getFeeData();
      gasPrice = feeData.gasPrice || parseUnits("1", "gwei");
    } catch (feeError) {
      console.warn("Could not get fee data, using default gas price");
      gasPrice = parseUnits("1", "gwei");
    }

    // Step 5: Add buffer to gas estimate
    const gasLimit = gasEstimate + (gasEstimate / BigInt(5));

    console.log("Sending vote transaction:", {
      proposalId,
      vote: vote === 0 ? "yay" : "nay",
      address,
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
    });

    // Step 6: Send the actual transaction
    const tx = await contract.voteProposal(proposalId, vote, {
      gasPrice,
      gasLimit,
    });

    console.log("Vote transaction sent:", tx.hash);
    return tx;
  } catch (error: any) {
    console.error("Error in voteProposal:", error);
    
    // If it's already a user-friendly error, rethrow it
    if (error.message && !error.message.includes("could not coalesce")) {
      throw error;
    }

    // Otherwise, try to extract a better message
    let msg =
      error?.reason ||
      error?.shortMessage ||
      error?.error?.message ||
      error?.data?.message ||
      error?.info?.error?.message ||
      error?.message ||
      "Failed to submit vote";

    // Improve the "could not coalesce error" message
    if (typeof msg === "string" && msg.includes("could not coalesce error")) {
      msg =
        "On-chain vote failed. The contract reverted the transaction. " +
        "This usually means: (1) you are not a DAO member with this wallet, " +
        "(2) the voting deadline has passed, or (3) this wallet has already voted on this proposal. " +
        `Please verify your membership status and the proposal's voting period.`;
    }

    throw new Error(msg);
  }
}

/**
 * Execute a proposal after voting period ends
 * @param proposalId - ID of the proposal to execute
 */
export async function executeProposal(proposalId: number) {
  await connectWithMetamask();
  const contract = getContract();
  const readOnlyContract = getReadOnlyContract();
  const address = await getCurrentAddress();

  if (!address) {
    throw new Error("Wallet not connected");
  }

  try {
    // Step 1: Verify proposal ID exists on-chain
    let totalProposals: bigint;
    try {
      totalProposals = await (readOnlyContract as any).numProposal();
      const maxId = Number(totalProposals);
      if (proposalId < 1 || proposalId > maxId) {
        throw new Error(
          `Invalid proposalId ${proposalId}. On-chain numProposal is ${maxId}.`
        );
      }
      console.log(`✓ Proposal ID ${proposalId} is valid (max: ${maxId})`);
    } catch (e: any) {
      console.error("Failed to verify proposalId:", e);
      throw new Error(
        e?.reason ||
          e?.message ||
          "Unable to verify proposal ID on-chain. Check that you are connected to the correct network/contract."
      );
    }

    // Step 2: Check if proposal is already executed (if we can read it)
    try {
      // Try to read the executed status - this might fail if proposal doesn't exist
      // Note: The contract has a bug where it uses numProposal instead of proposalId
      // So we'll proceed with execution attempt
      console.log(`Attempting to execute proposal ${proposalId}`);
    } catch (e) {
      console.warn("Could not check execution status:", e);
    }

    // Step 3: Estimate gas to catch revert reasons early
    let gasEstimate: bigint;
    try {
      gasEstimate = await contract.executeProposal.estimateGas(proposalId);
      console.log(`Gas estimate: ${gasEstimate.toString()}`);
    } catch (estimateError: any) {
      console.error("Gas estimation failed:", estimateError);
      const reason = estimateError?.reason || estimateError?.message || "Unknown error";
      
      // Provide helpful error messages
      if (reason.includes("already executed") || reason.includes("executed")) {
        throw new Error("This proposal has already been executed");
      }
      if (reason.includes("not a member") || reason.includes("onlyMember")) {
        throw new Error("You must be a DAO member to execute proposals");
      }
      if (reason.includes("deadline")) {
        throw new Error("Voting deadline has not passed yet");
      }
      
      throw new Error(`Cannot execute proposal: ${reason}`);
    }

    // Step 4: Get fee data
    const feeData = await provider!.getFeeData();
    const gasPrice = feeData.gasPrice || parseUnits("20", "gwei");
    
    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate + (gasEstimate / BigInt(5));

    console.log("Executing proposal with:", {
      proposalId,
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString(),
    });

    // Step 5: Execute the proposal
  const tx = await contract.executeProposal(proposalId, {
    gasPrice: gasPrice,
    gasLimit: gasLimit,
  });
  
  console.log("Execute proposal transaction:", tx);
  return tx;
  } catch (error: any) {
    console.error("Error executing proposal:", error);
    
    // Extract meaningful error message
    const reason = error?.reason || error?.message || "Unknown error";
    let msg = `Failed to execute proposal: ${reason}`;
    
    // Provide more helpful error messages
    if (reason.includes("Internal JSON-RPC error")) {
      msg = "Contract execution failed. The proposal may not exist on-chain, may already be executed, or there may be a contract issue. Please verify the proposal ID and try again.";
    } else if (reason.includes("not a member") || reason.includes("onlyMember")) {
      msg = "You must be a DAO member to execute proposals. Please join the DAO first.";
    } else if (reason.includes("already executed")) {
      msg = "This proposal has already been executed.";
    }
    
    throw new Error(msg);
  }
}

/**
 * Get the mUSDC token contract instance
 */
function getUSDCContract() {
  if (!signer) {
    throw new Error("Signer not initialized. Please connect wallet first.");
  }
  return new ethers.Contract(mockedUSDCAddress, mockedUSDCAbi, signer);
}

/**
 * Get the mUSDC token contract instance (read-only)
 */
function getReadOnlyUSDCContract() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(ETHERLINK_RPC);
  }
  return new ethers.Contract(mockedUSDCAddress, mockedUSDCAbi, provider);
}

/**
 * Get user's mUSDC balance
 * @returns Balance in smallest unit (6 decimals)
 */
export async function getUSDCBalance(): Promise<bigint> {
  const address = await getCurrentAddress();
  if (!address) {
    throw new Error("Wallet not connected");
  }
  
  const usdcContract = getReadOnlyUSDCContract();
  const balance = await usdcContract.balanceOf(address);
  return balance;
}

/**
 * Mint mUSDC tokens to user's wallet (for testing)
 * @param amount - Amount in token units (will be converted to smallest unit)
 */
export async function mintUSDC(amount: bigint) {
  await connectWithMetamask();
  const usdcContract = getUSDCContract();
  const address = await getCurrentAddress();
  
  if (!address) {
    throw new Error("Wallet not connected");
  }
  
  const isOnEtherlink = await checkEtherlinkNetwork();
  if (!isOnEtherlink) {
    throw new Error("Please switch to Etherlink Shadownet network");
  }
  
  // Get fee data
  const feeData = await provider!.getFeeData();
  const gasPrice = feeData.gasPrice || parseUnits("20", "gwei");
  
  // Estimate gas
  let gasLimit: bigint;
  try {
    gasLimit = await usdcContract.mintToSelf.estimateGas(amount);
    gasLimit = gasLimit + (gasLimit / BigInt(5)); // Add 20% buffer
  } catch (error: any) {
    console.error("Gas estimation failed:", error);
    gasLimit = BigInt(100000); // Fallback
  }
  
  console.log("Minting mUSDC:", {
    amount: amount.toString(),
    gasPrice: gasPrice.toString(),
    gasLimit: gasLimit.toString(),
  });
  
  const tx = await usdcContract.mintToSelf(amount, {
    gasPrice: gasPrice,
    gasLimit: gasLimit,
  });
  
  console.log("Mint transaction:", tx);
  return tx;
}

/**
 * Check if user has enough mUSDC balance
 * @param amount - Amount in token units (will be converted to smallest unit based on decimals)
 */
export async function checkUSDCBalance(amount: bigint): Promise<boolean> {
  const address = await getCurrentAddress();
  if (!address) {
    throw new Error("Wallet not connected");
  }
  
  const usdcContract = getReadOnlyUSDCContract();
  const balance = await usdcContract.balanceOf(address);
  return balance >= amount;
}

/**
 * Approve mUSDC tokens for the DAO contract to spend
 * @param amount - Amount in token smallest units (e.g., for 6 decimals: 1 USDC = 1000000)
 */
export async function approveUSDC(amount: bigint) {
  await connectWithMetamask();
  const usdcContract = getUSDCContract();
  const address = await getCurrentAddress();
  
  if (!address) {
    throw new Error("Wallet not connected");
  }
  
  const isOnEtherlink = await checkEtherlinkNetwork();
  if (!isOnEtherlink) {
    throw new Error("Please switch to Etherlink Shadownet network");
  }
  
  // Check current allowance
  const currentAllowance = await usdcContract.allowance(address, daoContractAddress);
  
  // If allowance is sufficient, skip approval
  if (currentAllowance >= amount) {
    console.log("Sufficient allowance already granted");
    return null;
  }
  
  // Get fee data
  const feeData = await provider!.getFeeData();
  const gasPrice = feeData.gasPrice || parseUnits("20", "gwei");
  
  // Estimate gas for approval
  let gasLimit: bigint;
  try {
    gasLimit = await usdcContract.approve.estimateGas(daoContractAddress, amount);
    gasLimit = gasLimit + (gasLimit / BigInt(5)); // Add 20% buffer
  } catch (error: any) {
    console.error("Gas estimation failed:", error);
    gasLimit = BigInt(100000); // Fallback
  }
  
  console.log("Approving mUSDC:", {
    spender: daoContractAddress,
    amount: amount.toString(),
    gasPrice: gasPrice.toString(),
    gasLimit: gasLimit.toString(),
  });
  
  const tx = await usdcContract.approve(daoContractAddress, amount, {
    gasPrice: gasPrice,
    gasLimit: gasLimit,
  });
  
  console.log("Approve transaction:", tx);
  return tx;
}

/**
 * Buy a lot (after proposal is executed) using mUSDC tokens
 * @param amount - The amount of mUSDC tokens to send (in smallest unit, e.g., for 6 decimals: 1 USDC = 1000000)
 */
export async function buyLot(amount: bigint) {
  await connectWithMetamask();
  const contract = getContract();
  const address = await getCurrentAddress();
  
  if (!address) {
    throw new Error("Wallet not connected");
  }
  
  const isOnEtherlink = await checkEtherlinkNetwork();
  if (!isOnEtherlink) {
    throw new Error("Please switch to Etherlink Shadownet network");
  }
  
  // Check if user has enough mUSDC balance
  const hasBalance = await checkUSDCBalance(amount);
  if (!hasBalance) {
    throw new Error("Insufficient mUSDC balance. Please ensure you have enough tokens.");
  }
  
  // Approve tokens first
  const approveTx = await approveUSDC(amount);
  if (approveTx) {
    console.log("Waiting for approval transaction to be confirmed...");
    await approveTx.wait();
    console.log("Approval confirmed");
  }
  
  // Get fee data
  const feeData = await provider!.getFeeData();
  const gasPrice = feeData.gasPrice || parseUnits("20", "gwei");
  
  // Estimate gas for buyLot
  let gasLimit: bigint;
  try {
    gasLimit = await contract.buyLot.estimateGas();
    // Add 20% buffer
    gasLimit = gasLimit + (gasLimit / BigInt(5));
  } catch (error: any) {
    console.error("Gas estimation failed:", error);
    gasLimit = BigInt(300000); // Fallback to default
  }
  
  console.log("Buying lot with mUSDC:", {
    amount: amount.toString(),
    gasPrice: gasPrice.toString(),
    gasLimit: gasLimit.toString(),
  });
  
  const tx = await contract.buyLot({
    gasPrice: gasPrice,
    gasLimit: gasLimit,
  });
  
  console.log("Buy lot transaction:", tx);
  return tx;
}

/**
 * Withdraw funds from the DAO (owner only)
 */
export async function withdraw() {
  await connectWithMetamask();
  const contract = getContract();
  
  const gasPrice = parseUnits("20", "gwei");
  const gasLimit = 300000;
  
  const tx = await contract.withdraw({
    gasPrice: gasPrice,
    gasLimit: gasLimit,
  });
  
  console.log("Withdraw transaction:", tx);
  return tx;
}

// ========== Read-only functions ==========

/**
 * Get the total number of proposals
 */
export async function getNumProposals(): Promise<number> {
  const contract = getReadOnlyContract();
  const numProposals = await contract.numProposal();
  return Number(numProposals);
}

/**
 * Proposal interface matching the contract structure
 */
export interface Proposal {
  id: string;
  proposalId: number;
  lotSize: number;
  sharePrice: number;
  maxPerInvestor: number;
  proposalSummary: string;
  deadline: number; // Unix timestamp
  user: string; // Address
  yayVotes: number;
  nayVotes: number;
  executed: boolean;
  status: "voting" | "closed" | "marketplace";
  createdAt: Date;
  votingEndsAt: Date;
}

/**
 * Get a single proposal by ID
 * Note: Since the Proposal struct has a nested mapping (voted), 
 * Solidity doesn't generate a public getter for the struct.
 * We need to catch the error and return null gracefully.
 * @param proposalId - Proposal ID (1-indexed)
 */
export async function getProposal(proposalId: number): Promise<Proposal | null> {
  try {
    const contract = getReadOnlyContract();
    
    // Since the struct has a nested mapping, we can't read it directly
    // The contract needs getter functions for individual fields, or we need to use events
    // For now, catch the error and return null
    try {
      const proposal = await contract.idToProposal(proposalId);
      
      // If we get here, the getter works (unlikely with nested mapping)
      const deadline = Number(proposal.deadline);
      if (deadline === 0) {
        return null;
      }
      
      const now = Math.floor(Date.now() / 1000);
      let status: "voting" | "closed" | "marketplace" = "voting";
      if (deadline <= now) {
        status = proposal.executed ? "closed" : "marketplace";
      }
      
      return {
        id: proposalId.toString(),
        proposalId: proposalId,
        lotSize: Number(proposal.lotSize),
        sharePrice: Number(proposal.SharePrice),
        maxPerInvestor: Number(proposal.maxPerInvestor),
        proposalSummary: proposal.proposalSummary,
        deadline: deadline,
        user: proposal.user,
        yayVotes: Number(proposal.yayVotes),
        nayVotes: Number(proposal.nayVotes),
        executed: proposal.executed,
        status: status,
        createdAt: new Date((deadline - 7 * 24 * 60 * 60) * 1000),
        votingEndsAt: new Date(deadline * 1000),
      };
    } catch (structError: any) {
      // Struct can't be read due to nested mapping
      // Use events to get basic info
      return await getProposalFromEvents(proposalId, contract);
    }
  } catch (error: any) {
    if (error.code === 'BAD_DATA' || error.message?.includes('could not decode')) {
      // Try events as fallback
      try {
        const contract = getReadOnlyContract();
        return await getProposalFromEvents(proposalId, contract);
      } catch (eventError) {
        console.warn(`Proposal ${proposalId} cannot be read`);
        return null;
      }
    }
    console.error(`Error fetching proposal ${proposalId}:`, error);
    return null;
  }
}

/**
 * Helper function to get proposal from events (fallback when struct can't be read)
 */
async function getProposalFromEvents(proposalId: number, contract: any): Promise<Proposal | null> {
  try {
    const provider = contract.provider;
    if (!provider) return null;
    
    const filter = contract.filters.proposalCreated();
    const events = await contract.queryFilter(filter);
    
    const proposalEvent = events.find((event: any) => {
      try {
        const parsed = contract.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        if (parsed?.args) {
          const eventProposalId = Number(parsed.args[0] || parsed.args.proposalId || 0);
          return eventProposalId === proposalId;
        }
      } catch (e) {
        return false;
      }
      return false;
    });
    
    if (!proposalEvent) return null;
    
    const parsed = contract.interface.parseLog({
      topics: proposalEvent.topics,
      data: proposalEvent.data
    });
    
    if (!parsed?.args) return null;
    
    const user = parsed.args[1] || parsed.args.user || "";
    const block = await provider.getBlock(proposalEvent.blockNumber);
    const createdAt = block?.timestamp || Math.floor(Date.now() / 1000);
    const deadline = createdAt + (7 * 24 * 60 * 60);
    const now = Math.floor(Date.now() / 1000);
    
    let status: "voting" | "closed" | "marketplace" = "voting";
    if (deadline <= now) {
      status = "marketplace";
    }
    
    return {
      id: proposalId.toString(),
      proposalId: proposalId,
      lotSize: 0,
      sharePrice: 0,
      maxPerInvestor: 0,
      proposalSummary: `Proposal ${proposalId}`,
      deadline: deadline,
      user: user,
      yayVotes: 0,
      nayVotes: 0,
      executed: false,
      status: status,
      createdAt: new Date(createdAt * 1000),
      votingEndsAt: new Date(deadline * 1000),
    };
  } catch (error) {
    console.error(`Error getting proposal ${proposalId} from events:`, error);
    return null;
  }
}

/**
 * Get all proposals - reads from Supabase first (since contract struct can't be read directly due to nested mapping)
 * Falls back to events if Supabase is empty
 */
export async function getAllProposals(): Promise<Proposal[]> {
  try {
    // First try to get from Supabase (this is where proposals are stored when created)
    const { getProposalsFromSupabase } = await import('./daoProposals');
    const supabaseProposals = await getProposalsFromSupabase();
    
    if (supabaseProposals.length > 0) {
      console.log(`Loaded ${supabaseProposals.length} proposals from Supabase`);
      return supabaseProposals;
    }
    
    // Fallback: Try to get from contract using events (if Supabase is empty)
    console.log("No proposals in Supabase, trying to fetch from contract events...");
    const contract = getReadOnlyContract();
    const numProposals = await contract.numProposal();
    const totalProposals = Number(numProposals);
    
    if (totalProposals === 0) {
      return [];
    }
    
    const proposals: Proposal[] = [];
    
    // Try to fetch each proposal using events (getProposal falls back to events)
    for (let i = 1; i <= totalProposals; i++) {
      try {
        const proposal = await getProposal(i);
        if (proposal) {
          proposals.push(proposal);
        }
      } catch (error) {
        // Skip proposals that can't be read
        console.warn(`Skipping proposal ${i} due to read error:`, error);
      }
    }
    
    // Sort by proposalId (newest first)
    return proposals.sort((a, b) => b.proposalId - a.proposalId);
  } catch (error) {
    console.error("Error fetching all proposals:", error);
    return [];
  }
}

/**
 * Check if an address is a DAO member
 * @param address - Address to check
 */
export async function isDaoMember(address: string): Promise<boolean> {
  try {
    const contract = getReadOnlyContract();
    // addressToUser returns a struct, but the ABI shows it returns just the isMember bool
    // Try both ways to handle different ABI formats
    let result;
    try {
      result = await contract.addressToUser(address);
      // If result is an object with isMember property
      if (typeof result === 'object' && result !== null && 'isMember' in result) {
        return Boolean(result.isMember);
      }
      // If result is directly a boolean
      if (typeof result === 'boolean') {
        return result;
      }
      // If result is an array (struct returned as array)
      if (Array.isArray(result) && result.length > 0) {
        return Boolean(result[0]); // First element should be isMember
      }
      // Default: try to access isMember
      return Boolean(result.isMember);
    } catch (callError: any) {
      console.error("Error calling addressToUser:", callError);
      throw callError;
    }
  } catch (error: any) {
    console.error("Error checking DAO membership:", error);
    
    // Handle specific error cases
    if (error.code === 'BAD_DATA' || error.message?.includes('could not decode')) {
      console.warn("Contract call failed - contract may not exist at this address or wrong network");
      return false;
    }
    
    // If contract call fails for any other reason, return false (user is not a member)
    return false;
  }
}

/**
 * Get the contract owner address
 */
export async function getContractOwner(): Promise<string> {
  const contract = getReadOnlyContract();
  return await contract.owner();
}

/**
 * Get the current connected wallet address
 * This function does NOT trigger a popup - it only checks for already-connected accounts
 */
export async function getCurrentAddress(): Promise<string | null> {
  if (typeof window === "undefined" || (window as any).ethereum == null) {
    return null;
  }

  // First, check if we already have a signer
  if (signer) {
    try {
    return await signer.getAddress();
    } catch (error) {
      console.warn("Signer no longer valid, checking accounts:", error);
      signer = null;
    }
  }

  // Check for connected accounts without triggering popup
  // eth_accounts does NOT trigger a popup - it only returns already-connected accounts
  try {
    const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length > 0) {
      // Initialize provider if not already done (but don't get signer)
      if (!provider) {
        await initializeProvider();
      }
      // Return the first account address directly (no need to get signer)
      // This avoids any potential popup from getSigner()
      return accounts[0];
    }
  } catch (error) {
    console.warn("Error getting current address (no popup):", error);
  }

  return null;
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  return signer !== null;
}

