import { MOCK_WALLET_ADDRESS } from "./utils";

// Mock Users
export const mockUsers = [
  { id: "1", name: "DAO Member 1", walletAddress: MOCK_WALLET_ADDRESS, role: "dao" },
  { id: "2", name: "DAO Member 2", walletAddress: "0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9", role: "dao" },
  { id: "3", name: "DAO Member 3", walletAddress: "0x28a8746e75304c0780E011BEd21C72cD78cd535E", role: "dao" },
  { id: "4", name: "Manufacturer 1", role: "manufacturer" },
  { id: "5", name: "Diligence Firm", role: "diligence" },
  { id: "6", name: "Investor 1", walletAddress: MOCK_WALLET_ADDRESS, role: "investor" },
];

// Generate a future date
const futureDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// Generate a past date
const pastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Mock Proposals
export const mockProposals = [
  {
    id: "1",
    title: "Car Parts Manufacturing Expansion",
    summary: "Funding for expansion of high-margin car parts manufacturing line",
    fundingAmount: 500000,
    profitShare: 12,
    lotSize: 5000,
    lotPrice: 5000, 
    minPerInvestor: 1,
    maxPerInvestor: 10,
    investmentPeriod: 12, // months
    status: "voting",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    votingEndsAt: futureDate(4), // 4 days from now
    manufacturerId: "4",
    applicationId: "app-1",
    totalLots: 100,
    soldLots: 0,
    riskScore: 4,
    researchSummary: "This established manufacturer has shown consistent growth in the automotive parts sector. Their expansion into higher-margin specialized components presents a compelling investment opportunity with moderate risk.",
    riskAssessment: "Medium-low risk due to established operations, strong management team, and growing market demand. Some exposure to automotive industry cyclicality.",
    expectedROI: 18,
  },
  {
    id: "2", 
    title: "Semiconductor Component Production",
    summary: "Investment in high-profit semiconductor component production",
    fundingAmount: 750000,
    profitShare: 15,
    lotSize: 10000,
    lotPrice: 7500,
    minPerInvestor: 1,
    maxPerInvestor: 5,
    investmentPeriod: 18, // months
    status: "voting",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    votingEndsAt: futureDate(2), // 2 days from now
    manufacturerId: "4",
    applicationId: "app-2",
    totalLots: 75,
    soldLots: 0,
    riskScore: 6,
    researchSummary: "This manufacturer specializes in precision semiconductor components with high margins. Their technology is proven, and they have secured contracts with several major electronics manufacturers.",
    riskAssessment: "Medium risk due to semiconductor market volatility. Strong technical team and established client relationships mitigate some concerns.",
    expectedROI: 22,
  },
  {
    id: "3",
    title: "Medical Device Manufacturing",
    summary: "Funding for high-margin medical device manufacturing",
    fundingAmount: 1000000,
    profitShare: 18,
    lotSize: 20000,
    lotPrice: 10000,
    minPerInvestor: 2,
    maxPerInvestor: 8,
    investmentPeriod: 24, // months
    status: "closed",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    votingEndsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    manufacturerId: "4",
    applicationId: "app-3",
    totalLots: 50,
    soldLots: 0,
    riskScore: 5,
    researchSummary: "This medical device manufacturer has proprietary technology with FDA approval. Their products are already in use in several major hospital networks with strong feedback.",
    riskAssessment: "Medium risk. Regulatory approvals are already in place, but scale-up challenges remain. Strong intellectual property portfolio is a significant asset.",
    expectedROI: 25,
  },
  {
    id: "4",
    title: "Industrial Equipment Production",
    summary: "Investment in industrial equipment manufacturing facility",
    fundingAmount: 1200000,
    profitShare: 20,
    lotSize: 15000,
    lotPrice: 12000,
    minPerInvestor: 1,
    maxPerInvestor: 10,
    investmentPeriod: 36, // months
    status: "marketplace",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    votingEndsAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    manufacturerId: "4",
    applicationId: "app-4",
    totalLots: 80,
    soldLots: 38,
    riskScore: 3,
    researchSummary: "This manufacturer produces essential industrial equipment with a strong track record spanning 15 years. Their expansion will allow them to meet excess demand they currently cannot fulfill.",
    riskAssessment: "Low risk due to established operations, long-term contracts, and high demand. The company has successfully executed similar expansions twice before.",
    expectedROI: 30,
  },
  {
    id: "5",
    title: "Electronics Assembly Expansion",
    summary: "Funding for expansion of electronics assembly operations",
    fundingAmount: 650000,
    profitShare: 14,
    lotSize: 5000,
    lotPrice: 6500,
    minPerInvestor: 1,
    maxPerInvestor: 15,
    investmentPeriod: 12, // months
    status: "marketplace",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    votingEndsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    manufacturerId: "4",
    applicationId: "app-5",
    totalLots: 100,
    soldLots: 75,
    riskScore: 4,
    researchSummary: "This electronics assembly operation has contracts with major consumer electronics brands. Their expansion will add capacity for a new product line already secured by contract.",
    riskAssessment: "Medium-low risk with established customer base and contractual obligations for future sales. Some exposure to consumer electronics market fluctuations.",
    expectedROI: 19,
  },
  {
    id: "6",
    title: "Advanced Materials Production",
    summary: "Investment in specialized advanced materials manufacturing",
    fundingAmount: 850000,
    profitShare: 16,
    lotSize: 8500,
    lotPrice: 8500,
    minPerInvestor: 1,
    maxPerInvestor: 8,
    investmentPeriod: 24, // months
    status: "marketplace",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    votingEndsAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
    manufacturerId: "4",
    applicationId: "app-6",
    totalLots: 100,
    soldLots: 92,
    riskScore: 7,
    researchSummary: "This manufacturer produces cutting-edge materials used in aerospace and defense applications. They have proprietary processes and long-term government contracts.",
    riskAssessment: "Medium-high risk due to technical complexity, but mitigated by secure government contracts and proprietary technology advantages.",
    expectedROI: 28,
  },
];

// Mock Votes
export const mockVotes = [
  // Votes for Proposal 1
  {
    id: "vote-1-1",
    proposalId: "1",
    userId: "1",
    lotSize: 5000,
    sharePrice: 5000,
    maxPerInvestor: 10,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "vote-1-2",
    proposalId: "1",
    userId: "2",
    lotSize: 6000,
    sharePrice: 4500,
    maxPerInvestor: 8,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "vote-1-3",
    proposalId: "1",
    userId: "3",
    lotSize: 5000,
    sharePrice: 5000,
    maxPerInvestor: 12,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },

  // Votes for Proposal 2
  {
    id: "vote-2-1",
    proposalId: "2",
    userId: "1",
    lotSize: 10000,
    sharePrice: 7500,
    maxPerInvestor: 5,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: "vote-2-2",
    proposalId: "2",
    userId: "2",
    lotSize: 12000,
    sharePrice: 7000,
    maxPerInvestor: 6,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },

  // Votes for Proposal 3 (closed)
  {
    id: "vote-3-1",
    proposalId: "3",
    userId: "1",
    lotSize: 20000,
    sharePrice: 10000,
    maxPerInvestor: 8,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
  },
  {
    id: "vote-3-2",
    proposalId: "3",
    userId: "2",
    lotSize: 20000,
    sharePrice: 10000,
    maxPerInvestor: 8,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },
  {
    id: "vote-3-3",
    proposalId: "3",
    userId: "3",
    lotSize: 15000,
    sharePrice: 12000,
    maxPerInvestor: 6,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];

// Mock Comments
export const mockComments = [
  {
    id: "comment-1-1",
    proposalId: "1",
    userId: "1",
    userName: "DAO Member 1",
    content: "This proposal looks promising. The manufacturer has a solid track record.",
    attachments: [],
    createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), // 2.5 days ago
  },
  {
    id: "comment-1-2",
    proposalId: "1",
    userId: "2",
    userName: "DAO Member 2",
    content: "I think the lot size could be slightly higher to attract more serious investors.",
    attachments: [],
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
  },
  {
    id: "comment-2-1",
    proposalId: "2",
    userId: "1",
    userName: "DAO Member 1",
    content: "I've reviewed the detailed manufacturing plan and it seems viable. The profit projections are realistic.",
    attachments: ["attachment-1.pdf"],
    createdAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000), // 4.5 days ago
  },
  {
    id: "comment-3-1",
    proposalId: "3",
    userId: "3",
    userName: "DAO Member 3",
    content: "Happy with how this proposal turned out. The terms are fair for both sides.",
    attachments: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
];

// Mock Investments
export const mockInvestments = [
  {
    id: "inv-1",
    userId: "6",
    proposalId: "4",
    lots: 5,
    lotPrice: 12000,
    totalAmount: 60000,
    purchaseDate: pastDate(14),
    status: "active",
    expectedReturn: 12000,
    currentReturn: 4000,
    claimableReturn: 2000,
    nextPayoutDate: futureDate(16),
  },
  {
    id: "inv-2",
    userId: "6",
    proposalId: "5",
    lots: 10,
    lotPrice: 6500,
    totalAmount: 65000,
    purchaseDate: pastDate(7),
    status: "active",
    expectedReturn: 9100,
    currentReturn: 1500,
    claimableReturn: 1500,
    nextPayoutDate: futureDate(23),
  },
  {
    id: "inv-3",
    userId: "6",
    proposalId: "6",
    lots: 3,
    lotPrice: 8500,
    totalAmount: 25500,
    purchaseDate: pastDate(5),
    status: "active",
    expectedReturn: 4080,
    currentReturn: 0,
    claimableReturn: 0,
    nextPayoutDate: futureDate(25),
  },
];

// Mock Transactions
export const mockTransactions = [
  {
    id: "tx-1",
    userId: "6",
    type: "purchase",
    proposalId: "4",
    proposalTitle: "Industrial Equipment Production",
    amount: 60000,
    lots: 5,
    status: "completed",
    timestamp: pastDate(14),
  },
  {
    id: "tx-2",
    userId: "6",
    type: "purchase",
    proposalId: "5",
    proposalTitle: "Electronics Assembly Expansion",
    amount: 65000,
    lots: 10,
    status: "completed",
    timestamp: pastDate(7),
  },
  {
    id: "tx-3",
    userId: "6",
    type: "purchase",
    proposalId: "6",
    proposalTitle: "Advanced Materials Production",
    amount: 25500,
    lots: 3,
    status: "completed",
    timestamp: pastDate(5),
  },
  {
    id: "tx-4",
    userId: "6",
    type: "return",
    proposalId: "4",
    proposalTitle: "Industrial Equipment Production",
    amount: 2000,
    status: "completed",
    timestamp: pastDate(2),
  },
  {
    id: "tx-5",
    userId: "6",
    type: "return",
    proposalId: "5",
    proposalTitle: "Electronics Assembly Expansion",
    amount: 1500,
    status: "completed",
    timestamp: pastDate(1),
  },
];

// Mock Notifications
export const mockNotifications = [
  {
    id: "notif-1",
    userId: "6",
    type: "investment_confirmation",
    proposalId: "6",
    proposalTitle: "Advanced Materials Production",
    message: "Your investment of $25,500 (3 lots) in Advanced Materials Production has been confirmed.",
    read: true,
    timestamp: pastDate(5),
  },
  {
    id: "notif-2",
    userId: "6",
    type: "return_payout",
    proposalId: "4",
    proposalTitle: "Industrial Equipment Production",
    message: "You have received a return of $2,000 from your investment in Industrial Equipment Production.",
    read: true,
    timestamp: pastDate(2),
  },
  {
    id: "notif-3",
    userId: "6",
    type: "return_payout",
    proposalId: "5",
    proposalTitle: "Electronics Assembly Expansion",
    message: "You have received a return of $1,500 from your investment in Electronics Assembly Expansion.",
    read: false,
    timestamp: pastDate(1),
  },
  {
    id: "notif-4",
    userId: "6",
    type: "milestone",
    proposalId: "6",
    proposalTitle: "Advanced Materials Production",
    message: "Advanced Materials Production has reached 90% funding! Only 8 lots remaining.",
    read: false,
    timestamp: pastDate(1),
  },
  {
    id: "notif-5",
    userId: "6",
    type: "upcoming_payout",
    proposalId: "4",
    proposalTitle: "Industrial Equipment Production",
    message: "You have an upcoming return payment of approximately $2,000 from Industrial Equipment Production in 16 days.",
    read: false,
    timestamp: new Date(),
  },
]; 