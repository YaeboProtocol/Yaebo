import { 
  ApplicationStatus, 
  ManufacturerApplication, 
  Document, 
  Comment 
} from '@/types';
import { ManufacturerApplicationFormValues } from '@/lib/form-schemas';

// Mock storage of manufacturer applications
let applications: ManufacturerApplication[] = [];
let nextId = 1;
let nextDocId = 1;
let nextCommentId = 1;

// Mock document upload function
export const uploadDocument = async (file: File, type: string): Promise<Document> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const document: Document = {
    id: `doc-${nextDocId++}`,
    name: file.name,
    type: file.type,
    url: URL.createObjectURL(file),
    createdAt: new Date().toISOString()
  };
  
  return document;
};

// Mock create application function
export const createApplication = async (formData: ManufacturerApplicationFormValues): Promise<ManufacturerApplication> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const newApplication: ManufacturerApplication = {
    id: `app-${nextId++}`,
    companyInfo: formData.companyInfo,
    smeInfo: formData.smeInfo,
    documents: {
      ...formData.documents,
      additionalDocs: []
    },
    investmentTerms: {
      ...formData.investmentTerms,
      lotPrice: 0,
      totalLots: 0,
      maxPerInvestor: 0
    },
    status: 'Draft',
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  applications.push(newApplication);
  return newApplication;
};

// Mock update application function
export const updateApplication = async (
  id: string, 
  updates: Partial<ManufacturerApplication>
): Promise<ManufacturerApplication> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const index = applications.findIndex(app => app.id === id);
  if (index === -1) {
    throw new Error(`Application with ID ${id} not found`);
  }
  
  const updatedApplication = {
    ...applications[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  applications[index] = updatedApplication;
  return updatedApplication;
};

// Mock submit application function
export const submitApplication = async (id: string): Promise<ManufacturerApplication> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return updateApplication(id, { status: 'Submitted' });
};

// Mock get application function
export const getApplication = async (id: string): Promise<ManufacturerApplication | null> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const application = applications.find(app => app.id === id);
  return application || null;
};

// Mock get all applications function
export const getApplications = async (): Promise<ManufacturerApplication[]> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...applications];
};

// Mock add comment function
export const addComment = async (
  applicationId: string, 
  content: string, 
  attachments: Document[] = [],
  role: 'Manufacturer' | 'Diligence' | 'DAO' | 'Investor' = 'Manufacturer'
): Promise<Comment> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const application = applications.find(app => app.id === applicationId);
  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }
  
  const newComment: Comment = {
    id: `comment-${nextCommentId++}`,
    user: {
      id: 'user-1',
      name: role === 'Manufacturer' ? application.companyInfo.name : `${role} User`,
      role,
      avatar: `https://ui-avatars.com/api/?name=${role}&background=random`
    },
    content,
    attachments,
    createdAt: new Date().toISOString()
  };
  
  application.comments.push(newComment);
  return newComment;
};

// Mock add document function
export const addDocument = async (
  applicationId: string,
  documentType: keyof ManufacturerApplication['documents'],
  file: File
): Promise<Document> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const document = await uploadDocument(file, file.type);
  
  const application = applications.find(app => app.id === applicationId);
  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }
  
  if (documentType === 'additionalDocs') {
    application.documents.additionalDocs.push(document);
  } else {
    (application.documents as any)[documentType] = document;
  }
  
  return document;
};

// Mock add research paper function
export const addResearchPaper = async (
  applicationId: string,
  file: File
): Promise<Document> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const document = await uploadDocument(file, file.type);
  
  const application = applications.find(app => app.id === applicationId);
  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }
  
  // Create research object if it doesn't exist
  if (!application.research) {
    application.research = {
      researchPaper: null,
      summary: "Research analysis pending completion",
      keyMetrics: "Key metrics will be populated after research completion",
      riskScore: 50,
      projections: "Projections will be provided after analysis"
    };
  }
  
  // Update research paper
  application.research.researchPaper = document;
  
  return document;
};

// Initialize with a mock application for testing
export const initMockData = () => {
  const mockApplication: ManufacturerApplication = {
    id: 'app-0',
    companyInfo: {
      name: 'TechManufacture Inc.',
      stellarPubkey: 'GBLTXIBT7QYF2JW7OZAYDWYTVJ2FGDLB63AND5GG4YKAYHP3KZ5JGZWA',
      contact: 'contact@techmanufacture.com',
      website: 'https://techmanufacture.com'
    },
    smeInfo: {
      name: 'TechManufacture Inc.',
      regNumber: 'TM12345',
      jurisdiction: 'Delaware, USA',
      address: '123 Tech Lane, Silicon Valley, CA',
      website: 'https://techmanufacture.com'
    },
    documents: {
      incorporationCert: {
        id: 'doc-1',
        name: 'incorporation-certificate.pdf',
        type: 'application/pdf',
        url: '/mock-files/incorporation-certificate.pdf',
        createdAt: new Date().toISOString()
      },
      taxCert: {
        id: 'doc-2',
        name: 'tax-certificate.pdf',
        type: 'application/pdf',
        url: '/mock-files/tax-certificate.pdf',
        createdAt: new Date().toISOString()
      },
      auditedFinancials: null,
      businessPlan: null,
      kyc: null,
      useOfProceeds: null,
      riskReport: null,
      additionalDocs: []
    },
    investmentTerms: {
      totalFundingAmount: 1000000,
      investorSharePercentage: 60,
      minPeriod: 12,
      expectedReturn: 15,
      useOfFundsBreakdown: 'Equipment (40%), Operations (30%), R&D (20%), Marketing (10%)',
      lotPrice: 0,
      totalLots: 0,
      maxPerInvestor: 0
    },
    status: 'Under Review',
    comments: [
      {
        id: 'comment-1',
        user: {
          id: 'user-diligence',
          name: 'Diligence Team',
          role: 'Diligence',
          avatar: 'https://ui-avatars.com/api/?name=Diligence&background=random'
        },
        content: 'We need additional financial projections for the next 3 years. Please upload them as soon as possible.',
        attachments: [],
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString()
  };
  
  applications = [mockApplication];
  nextId = 1;
  nextDocId = 3;
  nextCommentId = 2;
}; 