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
  lotPrice: z.number().positive({ message: "Lot price must be positive" }),
  totalLots: z.number().int().positive({ message: "Total lots must be a positive integer" }),
  maxPerInvestor: z.number().int().positive({ message: "Maximum per investor must be a positive integer" }),
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