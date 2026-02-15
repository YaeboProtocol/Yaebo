import { createClient } from '@/lib/supabase/server';
import { 
  ManufacturerApplicationFormValues,
  ManufacturerApplication,
  ApplicationStatus,
  Document,
  Comment,
  DocumentUpload
} from '@/types';
import { uploadFile } from './storage';

// Helper to convert database row to ManufacturerApplication
function mapDbRowToApplication(row: any, documents: any[] = [], comments: any[] = []): ManufacturerApplication {
  // Group documents by type
  const documentsByType: Record<string, Document | null> = {
    incorporationCert: null,
    taxCert: null,
    auditedFinancials: null,
    businessPlan: null,
    kyc: null,
    useOfProceeds: null,
    riskReport: null,
  };
  const additionalDocs: Document[] = [];

  documents.forEach((doc) => {
    const docObj: Document = {
      id: doc.id,
      name: doc.file_name,
      type: doc.file_type,
      url: doc.file_url,
      createdAt: doc.created_at,
    };

    if (doc.document_type === 'additional') {
      additionalDocs.push(docObj);
    } else {
      // Map database document_type to TypeScript key
      const typeMap: Record<string, keyof typeof documentsByType> = {
        'incorporation_cert': 'incorporationCert',
        'tax_cert': 'taxCert',
        'audited_financials': 'auditedFinancials',
        'business_plan': 'businessPlan',
        'kyc': 'kyc',
        'use_of_proceeds': 'useOfProceeds',
        'risk_report': 'riskReport',
      };
      const key = typeMap[doc.document_type];
      if (key) {
        documentsByType[key] = docObj;
      }
    }
  });

  // Map comments
  const mappedComments: Comment[] = comments.map((comment) => ({
    id: comment.id,
    user: {
      id: comment.user_id || 'unknown',
      name: comment.user_name,
      role: comment.user_role as Comment['user']['role'],
      avatar: comment.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name)}&background=random`,
    },
    content: comment.content,
    attachments: [], // Will be populated separately if needed
    createdAt: comment.created_at,
  }));

  return {
    id: row.id,
    companyInfo: {
      name: row.company_name,
      MantlePubkey: row.wallet_address || '',
      contact: row.company_contact_email,
      website: row.company_website,
    },
    smeInfo: {
      name: row.sme_name,
      regNumber: row.sme_reg_number,
      jurisdiction: row.sme_jurisdiction,
      address: row.sme_address,
      website: row.sme_website,
    },
    documents: {
      ...documentsByType,
      additionalDocs,
    },
    investmentTerms: {
      totalFundingAmount: Number(row.total_funding_amount),
      investorSharePercentage: Number(row.investor_share_percentage),
      minPeriod: row.min_period_months,
      expectedReturn: Number(row.expected_return_percentage),
      useOfFundsBreakdown: row.use_of_funds_breakdown,
      lotPrice: Number(row.lot_price || 0),
      totalLots: row.total_lots || 0,
      maxPerInvestor: row.max_per_investor || 0,
    },
    status: row.status as ApplicationStatus,
    comments: mappedComments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Create a new application
export async function createApplication(
  formData: ManufacturerApplicationFormValues,
  userId?: string
): Promise<ManufacturerApplication> {
  const supabase = await createClient();
  
  // Get current user if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create an application');
    }
    userId = user.id;
  }

  // Insert main application record
  const { data: application, error: appError } = await supabase
    .from('manufacturer_applications')
    .insert({
      user_id: userId,
      company_name: formData.companyInfo.name,
      company_contact_email: formData.companyInfo.contact,
      company_website: formData.companyInfo.website,
      wallet_address: formData.companyInfo.MantlePubkey,
      sme_name: formData.smeInfo.name,
      sme_reg_number: formData.smeInfo.regNumber,
      sme_jurisdiction: formData.smeInfo.jurisdiction,
      sme_address: formData.smeInfo.address,
      sme_website: formData.smeInfo.website,
      total_funding_amount: formData.investmentTerms.totalFundingAmount,
      investor_share_percentage: formData.investmentTerms.investorSharePercentage,
      min_period_months: formData.investmentTerms.minPeriod,
      expected_return_percentage: formData.investmentTerms.expectedReturn,
      use_of_funds_breakdown: formData.investmentTerms.useOfFundsBreakdown,
      status: 'Draft',
    })
    .select()
    .single();

  if (appError) {
    console.error('Error creating application:', appError);
    throw new Error(`Failed to create application: ${appError.message}`);
  }

  // Upload documents if any
  if (formData.documents) {
    const documentPromises: Promise<void>[] = [];

    const documentTypes: Array<{ key: keyof DocumentUpload; dbType: string }> = [
      { key: 'incorporationCert', dbType: 'incorporation_cert' },
      { key: 'taxCert', dbType: 'tax_cert' },
      { key: 'auditedFinancials', dbType: 'audited_financials' },
      { key: 'businessPlan', dbType: 'business_plan' },
      { key: 'kyc', dbType: 'kyc' },
      { key: 'useOfProceeds', dbType: 'use_of_proceeds' },
      { key: 'riskReport', dbType: 'risk_report' },
    ];

    for (const { key, dbType } of documentTypes) {
      const doc = formData.documents[key];
      if (doc && doc instanceof File) {
        documentPromises.push(
          uploadApplicationDocument(application.id, doc, dbType)
        );
      } else if (doc && typeof doc === 'object' && 'url' in doc) {
        // Document already uploaded, just create reference
        documentPromises.push(
          createDocumentReference(application.id, doc as Document, dbType)
        );
      }
    }

    // Handle additional documents
    if (formData.documents.additionalDocs) {
      for (const doc of formData.documents.additionalDocs) {
        if (doc instanceof File) {
          documentPromises.push(
            uploadApplicationDocument(application.id, doc, 'additional')
          );
        } else if (doc && typeof doc === 'object' && 'url' in doc) {
          documentPromises.push(
            createDocumentReference(application.id, doc as Document, 'additional')
          );
        }
      }
    }

    await Promise.all(documentPromises);
  }

  // Fetch the complete application with documents
  return getApplication(application.id);
}

// Upload a document for an application
async function uploadApplicationDocument(
  applicationId: string,
  file: File,
  documentType: string
): Promise<Document> {
  // Upload to Supabase Storage
  const fileMetadata = await uploadFile(
    file,
    'application-documents',
    applicationId
  );

  // Create database record
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('application_documents')
    .insert({
      application_id: applicationId,
      document_type: documentType,
      file_name: fileMetadata.name,
      file_type: fileMetadata.type,
      file_size: fileMetadata.size,
      file_url: fileMetadata.url,
      storage_path: fileMetadata.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving document:', error);
    throw new Error(`Failed to save document: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.file_name,
    type: data.file_type,
    url: data.file_url,
    createdAt: data.created_at,
  };
}

// Create a document reference (for already uploaded files)
async function createDocumentReference(
  applicationId: string,
  document: Document,
  documentType: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('application_documents')
    .insert({
      application_id: applicationId,
      document_type: documentType,
      file_name: document.name,
      file_type: document.type,
      file_size: 0, // Unknown if already uploaded
      file_url: document.url,
      storage_path: document.id,
    });

  if (error) {
    console.error('Error creating document reference:', error);
    throw new Error(`Failed to create document reference: ${error.message}`);
  }
}

// Get an application by ID
export async function getApplication(id: string): Promise<ManufacturerApplication | null> {
  const supabase = await createClient();

  // Fetch application
  const { data: application, error: appError } = await supabase
    .from('manufacturer_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (appError || !application) {
    if (appError?.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching application:', appError);
    throw new Error(`Failed to fetch application: ${appError?.message || 'Unknown error'}`);
  }

  // Fetch documents
  const { data: documents, error: docsError } = await supabase
    .from('application_documents')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: true });

  if (docsError) {
    console.error('Error fetching documents:', docsError);
  }

  // Fetch comments
  const { data: comments, error: commentsError } = await supabase
    .from('application_comments')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  return mapDbRowToApplication(
    application,
    documents || [],
    comments || []
  );
}

// Get all applications for the current user
export async function getApplications(userId?: string): Promise<ManufacturerApplication[]> {
  const supabase = await createClient();

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }
    userId = user.id;
  }

  const { data: applications, error } = await supabase
    .from('manufacturer_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  // Fetch documents and comments for each application
  const applicationsWithDetails = await Promise.all(
    (applications || []).map(async (app) => {
      const { data: documents } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', app.id);

      const { data: comments } = await supabase
        .from('application_comments')
        .select('*')
        .eq('application_id', app.id)
        .order('created_at', { ascending: true });

      return mapDbRowToApplication(app, documents || [], comments || []);
    })
  );

  return applicationsWithDetails;
}

// Update an application
export async function updateApplication(
  id: string,
  updates: Partial<ManufacturerApplication>
): Promise<ManufacturerApplication> {
  const supabase = await createClient();

  const updateData: any = {};

  if (updates.status) {
    updateData.status = updates.status;
  }

  if (updates.companyInfo) {
    updateData.company_name = updates.companyInfo.name;
    updateData.company_contact_email = updates.companyInfo.contact;
    updateData.company_website = updates.companyInfo.website;
    updateData.wallet_address = updates.companyInfo.MantlePubkey;
  }

  if (updates.smeInfo) {
    updateData.sme_name = updates.smeInfo.name;
    updateData.sme_reg_number = updates.smeInfo.regNumber;
    updateData.sme_jurisdiction = updates.smeInfo.jurisdiction;
    updateData.sme_address = updates.smeInfo.address;
    updateData.sme_website = updates.smeInfo.website;
  }

  if (updates.investmentTerms) {
    updateData.total_funding_amount = updates.investmentTerms.totalFundingAmount;
    updateData.investor_share_percentage = updates.investmentTerms.investorSharePercentage;
    updateData.min_period_months = updates.investmentTerms.minPeriod;
    updateData.expected_return_percentage = updates.investmentTerms.expectedReturn;
    updateData.use_of_funds_breakdown = updates.investmentTerms.useOfFundsBreakdown;
    updateData.lot_price = updates.investmentTerms.lotPrice;
    updateData.total_lots = updates.investmentTerms.totalLots;
    updateData.max_per_investor = updates.investmentTerms.maxPerInvestor;
  }

  const { data, error } = await supabase
    .from('manufacturer_applications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating application:', error);
    throw new Error(`Failed to update application: ${error.message}`);
  }

  return getApplication(id) as Promise<ManufacturerApplication>;
}

// Submit an application (change status to Submitted)
export async function submitApplication(id: string): Promise<ManufacturerApplication> {
  return updateApplication(id, { status: 'Submitted' });
}

// Add a comment to an application
export async function addComment(
  applicationId: string,
  content: string,
  attachments: Document[] = [],
  role: 'Manufacturer' | 'Diligence' | 'DAO' | 'Investor' = 'Manufacturer'
): Promise<Comment> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to add comments');
  }

  // Get user metadata for name
  const userName = user.user_metadata?.name || user.email || 'Unknown User';
  const userAvatar = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  const { data: comment, error } = await supabase
    .from('application_comments')
    .insert({
      application_id: applicationId,
      user_id: user.id,
      content,
      user_role: role,
      user_name: userName,
      user_avatar: userAvatar,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }

  // Add attachments if any
  if (attachments.length > 0) {
    // First, ensure documents exist in application_documents
    // Then link them to the comment
    // This is a simplified version - you may want to handle this differently
    for (const attachment of attachments) {
      // Check if document already exists
      const { data: existingDoc } = await supabase
        .from('application_documents')
        .select('id')
        .eq('file_url', attachment.url)
        .eq('application_id', applicationId)
        .single();

      if (existingDoc) {
        // Link to comment
        await supabase
          .from('comment_attachments')
          .insert({
            comment_id: comment.id,
            document_id: existingDoc.id,
          });
      }
    }
  }

  return {
    id: comment.id,
    user: {
      id: comment.user_id || 'unknown',
      name: comment.user_name,
      role: comment.user_role as Comment['user']['role'],
      avatar: comment.user_avatar || userAvatar,
    },
    content: comment.content,
    attachments,
    createdAt: comment.created_at,
  };
}

// Add a document to an application
export async function addDocument(
  applicationId: string,
  documentType: keyof DocumentUpload | 'additional',
  file: File
): Promise<Document> {
  const dbType = documentType === 'additional' 
    ? 'additional' 
    : documentType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

  return uploadApplicationDocument(applicationId, file, dbType);
}

// Add research paper
export async function addResearchPaper(
  applicationId: string,
  file: File
): Promise<Document> {
  const document = await uploadApplicationDocument(applicationId, file, 'additional');

  const supabase = await createClient();
  
  // Update or create research record
  const { data: existingResearch } = await supabase
    .from('application_research')
    .select('id')
    .eq('application_id', applicationId)
    .single();

  if (existingResearch) {
    await supabase
      .from('application_research')
      .update({
        research_paper_document_id: document.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingResearch.id);
  } else {
    await supabase
      .from('application_research')
      .insert({
        application_id: applicationId,
        research_paper_document_id: document.id,
      });
  }

  return document;
}

