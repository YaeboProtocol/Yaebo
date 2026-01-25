export type ApplicationStatus = 
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Needs More Info'
  | 'Accepted'
  | 'Rejected';

export interface CompanyInfo {
  name: string;
  stellarPubkey: string;
  contact: string;
  website: string;
}

export interface SMEInfo {
  name: string;
  regNumber: string;
  jurisdiction: string;
  address: string;
  website: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface DocumentUpload {
  incorporationCert?: Document | null;
  taxCert?: Document | null;
  auditedFinancials?: Document | null;
  businessPlan?: Document | null;
  kyc?: Document | null;
  useOfProceeds?: Document | null;
  riskReport?: Document | null;
  additionalDocs: Document[];
}

export interface InspectionInfo {
  date: string;
  inspectorName: string;
  inspectorLicense: string;
  geo: string;
  auditReport: Document | null;
  sitePhotos: Document[];
}

export interface ResearchInfo {
  researchPaper: Document | null;
  summary: string;
  keyMetrics: string;
  riskScore: number;
  projections: string;
}

export interface InvestmentTerms {
  totalFundingAmount: number;
  investorSharePercentage: number;
  minPeriod: number;
  expectedReturn: number;
  useOfFundsBreakdown: string;
}

export interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    role: 'Manufacturer' | 'Diligence' | 'DAO' | 'Investor';
    avatar: string;
  };
  content: string;
  attachments: Document[];
  createdAt: string;
}

export interface ManufacturerApplication {
  id: string;
  companyInfo: CompanyInfo;
  smeInfo: SMEInfo;
  documents: DocumentUpload;
  inspection?: InspectionInfo;
  research?: ResearchInfo;
  investmentTerms: InvestmentTerms;
  status: ApplicationStatus;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
} 