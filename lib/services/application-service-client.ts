'use client';

import { createClient } from '@/lib/supabase/client';
import {
  ManufacturerApplication,
  ApplicationStatus,
  Document,
  Comment,
  DocumentUpload
} from '@/types';
import { ManufacturerApplicationFormValues } from '@/lib/form-schemas';
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

// Create a new application (client-side)
export async function createApplication(
  formData: ManufacturerApplicationFormValues
): Promise<ManufacturerApplication> {
  const supabase = createClient();
  
  console.log('Creating application with data:', formData);
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Error getting user:', userError);
    throw new Error(`Authentication error: ${userError.message}`);
  }
  if (!user) {
    console.error('No user found - user not authenticated');
    throw new Error('User must be authenticated to create an application. Please log in first.');
  }

  console.log('User authenticated:', user.id);

  // Check if user already has an application
  const { data: existingApplications, error: checkError } = await supabase
    .from('manufacturer_applications')
    .select('id, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (checkError) {
    console.error('Error checking for existing applications:', checkError);
    // Don't block creation if check fails, but log it
  }

  if (existingApplications && existingApplications.length > 0) {
    const existingApp = existingApplications[0];
    console.log('User already has an application:', existingApp.id);
    throw new Error(
      `You have already submitted an application. ` +
      `Your previous application (ID: ${existingApp.id}) was created on ${new Date(existingApp.created_at).toLocaleDateString()} ` +
      `and is currently in "${existingApp.status}" status. ` +
      `Please contact support if you need to make changes to your existing application.`
    );
  }

  // Prepare insert data
  const insertData = {
    user_id: user.id,
    company_name: formData.companyInfo.name,
    company_contact_email: formData.companyInfo.contact,
    company_website: formData.companyInfo.website,
    wallet_address: formData.companyInfo.MantlePubkey || null,
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
      status: 'Submitted', // Set to Submitted when form is completed
    };

  console.log('Inserting application data:', insertData);

  // Insert main application record
  const { data: application, error: appError } = await supabase
    .from('manufacturer_applications')
    .insert(insertData)
    .select()
    .single();

  if (appError) {
    console.error('Error creating application:', appError);
    console.error('Error details:', {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      hint: appError.hint,
    });
    throw new Error(`Failed to create application: ${appError.message}${appError.hint ? ` (${appError.hint})` : ''}`);
  }

  if (!application) {
    console.error('No application returned from insert');
    throw new Error('Failed to create application: No data returned');
  }

  console.log('Application created successfully:', application.id);

  // Upload documents if any (non-blocking - don't fail if documents fail)
  if (formData.documents) {
    try {
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
              .then(() => {})
              .catch(err => {
                console.warn(`Failed to upload document ${dbType}:`, err);
              })
          );
        } else if (doc && typeof doc === 'object' && 'url' in doc) {
          // Document already uploaded, just create reference
          documentPromises.push(
            createDocumentReference(application.id, doc as Document, dbType).catch(err => {
              console.warn(`Failed to create document reference ${dbType}:`, err);
            })
          );
        }
      }

      // Handle additional documents
      if (formData.documents.additionalDocs) {
        for (const doc of formData.documents.additionalDocs) {
          if (doc instanceof File) {
            documentPromises.push(
              uploadApplicationDocument(application.id, doc, 'additional')
                .then(() => {})
                .catch(err => {
                  console.warn('Failed to upload additional document:', err);
                })
            );
          } else if (doc && typeof doc === 'object' && 'url' in doc) {
            documentPromises.push(
              createDocumentReference(application.id, doc as Document, 'additional').catch(err => {
                console.warn('Failed to create additional document reference:', err);
              })
            );
          }
        }
      }

      await Promise.all(documentPromises);
      console.log('Documents processed');
    } catch (error) {
      console.warn('Error processing documents (non-critical):', error);
      // Don't throw - application is already created
    }
  }

  // Fetch the complete application with documents
  const completeApplication = await getApplication(application.id);
  if (!completeApplication) {
    throw new Error('Failed to fetch created application');
  }
  return completeApplication;
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
  const supabase = createClient();
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
  const supabase = createClient();
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
    // Don't throw - this is optional
  }
}

// Get an application by ID or slug (client-side)
export async function getApplication(idOrSlug: string): Promise<ManufacturerApplication | null> {
  const supabase = createClient();

  // Check if it's a UUID (36 characters with hyphens) or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  let application: any = null;

  if (isUUID) {
    // If it's a UUID, query by ID
    const { data, error: appError } = await supabase
      .from('manufacturer_applications')
      .select('*')
      .eq('id', idOrSlug)
      .single();

    if (appError) {
      if (appError.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching application:', appError);
      throw new Error(`Failed to fetch application: ${appError?.message || 'Unknown error'}`);
    }
    application = data;
  } else {
    // If it's a slug, we need to fetch all applications and match by slug
    // (In production, consider adding a slug column to the database for better performance)
    const { createSlug } = await import('@/lib/utils/slug');
    
    const { data: applications, error: appError } = await supabase
      .from('manufacturer_applications')
      .select('*');

    if (appError) {
      console.error('Error fetching applications:', appError);
      throw new Error(`Failed to fetch application: ${appError?.message || 'Unknown error'}`);
    }

    if (!applications || applications.length === 0) {
      return null; // Not found
    }

    // Find the application whose company name slug matches the provided slug
    const matchedApp = applications.find(app => 
      createSlug(app.company_name) === idOrSlug
    );

    if (!matchedApp) {
      return null; // Not found
    }

    application = matchedApp;
  }

  if (!application) {
    return null;
  }

  // Fetch documents
  const { data: documents, error: docsError } = await supabase
    .from('application_documents')
    .select('*')
    .eq('application_id', application.id)
    .order('created_at', { ascending: true });

  if (docsError) {
    console.error('Error fetching documents:', docsError);
  }

  // Fetch comments
  const { data: comments, error: commentsError } = await supabase
    .from('application_comments')
    .select('*')
    .eq('application_id', application.id)
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

// Get all applications for the current user (client-side)
export async function getApplications(): Promise<ManufacturerApplication[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data: applications, error } = await supabase
    .from('manufacturer_applications')
    .select('*')
    .eq('user_id', user.id)
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

// Get all applications (for diligence team - no user filter)
export async function getAllApplications(): Promise<ManufacturerApplication[]> {
  const supabase = createClient();

  // Get all applications (RLS policies will handle access control)
  const { data: applications, error } = await supabase
    .from('manufacturer_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all applications:', error);
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

// Update an application (client-side)
export async function updateApplication(
  id: string,
  updates: Partial<ManufacturerApplication>
): Promise<ManufacturerApplication> {
  const supabase = createClient();

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

  // First, update without select to avoid RLS issues
  const { error: updateError } = await supabase
    .from('manufacturer_applications')
    .update(updateData)
    .eq('id', id);

  if (updateError) {
    console.error('Error updating application:', updateError);
    console.error('Error details:', {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
    });
    throw new Error(`Failed to update application: ${updateError.message}${updateError.hint ? ` (${updateError.hint})` : ''}`);
  }

  // Fetch the complete updated application with documents and comments
  const updated = await getApplication(id);
  if (!updated) {
    throw new Error(`Failed to fetch updated application. The update may have succeeded but the application could not be retrieved.`);
  }
  return updated;
}

// Submit an application (change status to Submitted)
export async function submitApplication(id: string): Promise<ManufacturerApplication> {
  return updateApplication(id, { status: 'Submitted' });
}

// Add a comment to an application (client-side)
export async function addComment(
  applicationId: string,
  content: string,
  attachments: Document[] = [],
  role: 'Manufacturer' | 'Diligence' | 'DAO' | 'Investor' = 'Manufacturer'
): Promise<Comment> {
  const supabase = createClient();

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
    for (const attachment of attachments) {
      const { data: existingDoc } = await supabase
        .from('application_documents')
        .select('id')
        .eq('file_url', attachment.url)
        .eq('application_id', applicationId)
        .single();

      if (existingDoc) {
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

// Add a document to an application (client-side)
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

// Add research paper (client-side)
export async function addResearchPaper(
  applicationId: string,
  file: File
): Promise<Document> {
  const document = await uploadApplicationDocument(applicationId, file, 'additional');

  const supabase = createClient();
  
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

