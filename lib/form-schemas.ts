import { z } from 'zod';

export const companyInfoSchema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  stellarPubkey: z.string().min(1, { message: "Stellar public key is required" }),
  contact: z.string().email({ message: "Invalid email address" }),
  website: z.string().url({ message: "Invalid website URL" }).min(1, { message: "Website URL is required" }),
});

export const smeInfoSchema = z.object({
  name: z.string().min(1, { message: "SME name is required" }),
  regNumber: z.string().min(1, { message: "Registration number is required" }),
  jurisdiction: z.string().min(1, { message: "Jurisdiction is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  website: z.string().url({ message: "Invalid website URL" }).min(1, { message: "Website URL is required" }),
});

export const investmentTermsSchema = z.object({
  totalFundingAmount: z.number().positive({ message: "Funding amount must be positive" }),
  investorSharePercentage: z.number().min(0, { message: "Investor share must be non-negative" }).max(100, { message: "Investor share cannot exceed 100%" }),
  minPeriod: z.number().int().positive({ message: "Minimum period must be a positive integer" }),
  expectedReturn: z.number().positive({ message: "Expected return must be positive" }),
  useOfFundsBreakdown: z.string().min(1, { message: "Use of funds breakdown is required" }),
});

export const documentUploadSchema = z.object({
  businessPlan: z.any().optional().nullable(),
  financialStatements: z.any().optional().nullable(),
  identificationDocs: z.any().optional().nullable(),
  incorporationCert: z.any().optional().nullable(),
  taxCert: z.any().optional().nullable(),
  auditedFinancials: z.any().optional().nullable(),
  kyc: z.any().optional().nullable(),
  useOfProceeds: z.any().optional().nullable(),
  riskReport: z.any().optional().nullable(),
  additionalDocs: z.array(z.any()).optional(),
});

export const manufacturerApplicationSchema = z.object({
  companyInfo: companyInfoSchema,
  smeInfo: smeInfoSchema,
  documents: documentUploadSchema,
  investmentTerms: investmentTermsSchema,
});

export type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;
export type SMEInfoFormValues = z.infer<typeof smeInfoSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;
export type InvestmentTermsFormValues = z.infer<typeof investmentTermsSchema>;
export type ManufacturerApplicationFormValues = z.infer<typeof manufacturerApplicationSchema>;

// Proposal schemas
export const proposalSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  summary: z.string().min(1, { message: "Summary is required" }),
  fundingAmount: z.coerce.number().positive({ message: "Funding amount must be positive" }),
  profitShare: z.coerce.number().min(0, { message: "Profit share must be non-negative" }).max(100, { message: "Profit share cannot exceed 100%" }),
  lotSize: z.coerce.number().positive({ message: "Lot size must be positive" }),
  lotPrice: z.coerce.number().positive({ message: "Lot price must be positive" }),
  minPerInvestor: z.coerce.number().int({ message: "Minimum per investor must be a whole number" }).positive({ message: "Minimum per investor must be positive" }),
  maxPerInvestor: z.coerce.number().int({ message: "Maximum per investor must be a whole number" }).positive({ message: "Maximum per investor must be positive" }),
  investmentPeriod: z.coerce.number().int({ message: "Period must be a whole number" }).positive({ message: "Period must be positive" }),
  status: z.enum(["voting", "closed", "marketplace"]).default("voting"),
  createdAt: z.date().default(() => new Date()),
  votingEndsAt: z.date().default(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // One week from now
  manufacturerId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
});

export const voteSchema = z.object({
  proposalId: z.string().uuid(),
  userId: z.string().uuid(),
  lotSize: z.coerce.number().positive({ message: "Lot size must be positive" }),
  sharePrice: z.coerce.number().positive({ message: "Share price must be positive" }),
  maxPerInvestor: z.coerce.number().int({ message: "Maximum per investor must be a whole number" }).positive({ message: "Maximum per investor must be positive" }),
  createdAt: z.date().default(() => new Date()),
});

export const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
  attachments: z.array(z.string()).optional(),
});

// Investment schemas
export const investmentSchema = z.object({
  proposalId: z.string().min(1, { message: "Proposal ID is required" }),
  userId: z.string().min(1, { message: "User ID is required" }),
  lots: z.number().int({ message: "Lots must be a whole number" }).positive({ message: "Lots must be positive" }),
  lotPrice: z.number().positive({ message: "Lot price must be positive" }),
  totalAmount: z.number().positive({ message: "Total amount must be positive" }),
  purchaseDate: z.date().default(() => new Date()),
  status: z.enum(["pending", "active", "completed", "cancelled"]).default("pending"),
});

export const purchaseFormSchema = z.object({
  lots: z.coerce.number()
    .int({ message: "Number of lots must be a whole number" })
    .positive({ message: "Number of lots must be positive" }),
});

export const filterSchema = z.object({
  sortBy: z.enum(["newest", "oldestReturn", "highestReturn", "fundingProgress"]).default("newest"),
  riskLevel: z.enum(["all", "low", "medium", "high"]).default("all"),
  fundingStatus: z.enum(["all", "almostFunded", "newlyListed"]).default("all"),
  investmentPeriod: z.enum(["all", "short", "medium", "long"]).default("all"),
}); 