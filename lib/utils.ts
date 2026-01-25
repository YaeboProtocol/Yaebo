import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MOCK_WALLET_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"

// Mock wallet connection function
export const connectWallet = async (): Promise<{ address: string; connected: boolean }> => {
  // In a real app, this would connect to MetaMask or other wallet providers
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a mock successful connection
      resolve({
        address: MOCK_WALLET_ADDRESS,
        connected: true,
      })
    }, 1000) // Simulate network delay
  })
}

// Format proposal remaining time
export const formatRemainingTime = (endDate: Date): string => {
  const now = new Date()
  const remainingMs = endDate.getTime() - now.getTime()
  
  if (remainingMs <= 0) {
    return "Voting closed"
  }
  
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`
  } else {
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m remaining`
  }
}

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate vote distribution percentages for a proposal
export type VoteOption = {
  value: number
  count: number
  percentage: number
}

export const calculateVoteDistribution = (
  votes: Array<{ lotSize: number; sharePrice: number; maxPerInvestor: number }>,
  key: 'lotSize' | 'sharePrice' | 'maxPerInvestor'
): VoteOption[] => {
  if (!votes.length) return []
  
  // Count occurrences of each value
  const valueCounts = votes.reduce((acc, vote) => {
    const value = vote[key]
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  
  // Convert to array of options with percentages
  const totalVotes = votes.length
  return Object.entries(valueCounts).map(([valueStr, count]) => {
    const value = parseFloat(valueStr)
    return {
      value,
      count,
      percentage: Math.round((count / totalVotes) * 100)
    }
  }).sort((a, b) => b.count - a.count) // Sort by popularity
}

// Calculate expected return for an investment
export const calculateExpectedReturn = (
  investment: { lotPrice: number; profitShare: number; lots: number }
): number => {
  // Mock calculation - in reality would be more complex
  return (investment.lotPrice * investment.lots * investment.profitShare) / 100;
};

// Format percentage with sign
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Calculate funding progress
export const calculateFundingProgress = (soldLots: number, totalLots: number): number => {
  if (totalLots === 0) return 0;
  return Math.min(Math.round((soldLots / totalLots) * 100), 100);
};

// Calculate time left for investment period
export const calculateTimeLeft = (endDate: Date): string => {
  const now = new Date();
  const diffInMs = endDate.getTime() - now.getTime();
  
  if (diffInMs <= 0) {
    return "Ended";
  }
  
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays > 30) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
  }
};

// Format short date
export const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Calculate risk score color
export const getRiskScoreColor = (score: number): string => {
  if (score < 3) return "text-green-600";
  if (score < 6) return "text-amber-600";
  return "text-red-600";
};

// Process mock investment transaction
export const processMockInvestment = async (
  proposalId: string, 
  lots: number,
  lotPrice: number
): Promise<{ success: boolean; transactionId: string; timestamp: Date }> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a mock successful transaction
      resolve({
        success: true,
        transactionId: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date()
      });
    }, 1500); // Simulate network delay
  });
};

export function getReturnColor(returnPercentage: number): string {
  if (returnPercentage > 0) return "text-green-600";
  if (returnPercentage < 0) return "text-red-600";
  return "text-gray-600";
}

export function getShortAddress(addr: string | undefined) {
  if (!addr) return "";

  const lastIndex = addr.length - 1;
  return addr.substring(0, 4) + "..." + addr.substring(lastIndex - 3)
}