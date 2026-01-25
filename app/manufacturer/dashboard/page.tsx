'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { ManufacturerApplication, Document } from '@/types';
import { getApplication, addComment, addDocument, submitApplication, initMockData } from '@/lib/mock-service';
import ApplicationStatus from '@/components/manufacturer/dashboard/ApplicationStatus';
import DocumentList from '@/components/manufacturer/dashboard/DocumentList';
import CommentsSection from '@/components/manufacturer/dashboard/CommentsSection';
import { FileUpload } from '@/components/ui/file-upload';

export default function ManufacturerDashboardPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId') || 'app-0';
  
  const [application, setApplication] = useState<ManufacturerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mock data
    initMockData();
    
    // Fetch application data
    const fetchData = async () => {
      try {
        const data = await getApplication(applicationId);
        setApplication(data);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [applicationId]);

  const handleAddComment = async (content: string, attachments: Document[] = []) => {
    if (!application) return;
    
    try {
      await addComment(application.id, content, attachments);
      
      // Refresh application data
      const updatedApp = await getApplication(application.id);
      setApplication(updatedApp);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleSubmitApplication = async () => {
    if (!application) return;
    
    try {
      setSubmitting(true);
      
      // Check if application status is Draft
      if (application.status === 'Draft') {
        const updatedApp = await submitApplication(application.id);
        setApplication(updatedApp);
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (documentType: keyof ManufacturerApplication['documents'], file: File | null) => {
    if (!application || !file) return;
    
    try {
      setUploading(true);
      await addDocument(application.id, documentType, file);
      
      // Refresh application data
      const updatedApp = await getApplication(application.id);
      setApplication(updatedApp);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">Application Not Found</h1>
          <p className="mt-4 text-gray-500">
            We couldn't find the application you're looking for. Please check the URL or start a new application.
          </p>
          <div className="mt-8">
            <Link
              href="/manufacturer/apply"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Application
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const needsMoreInfo = application.status === 'Needs More Info';
  const isDraft = application.status === 'Draft';
  const canAddDocuments = needsMoreInfo || isDraft;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manufacturer Dashboard</h1>
          <p className="mt-2 text-gray-500">
            View and manage your application for debt tokenization.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div className="space-y-8">
          <ApplicationStatus status={application.status} updatedAt={application.updatedAt} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <DocumentList documents={application.documents} />
              
              {canAddDocuments && (
                <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {needsMoreInfo ? 'Upload Additional Documents' : 'Upload Documents'}
                  </h3>
                  
                  <div className="space-y-6">
                    <FileUpload
                      label="Upload Document"
                      accept="application/pdf,image/*"
                      onChange={(file) => handleFileUpload('additionalDocs', file)}
                      loading={uploading}
                    />
                    
                    <p className="text-sm text-gray-500">
                      Upload any additional documents requested by the diligence team or that you think would help your application.
                    </p>
                    
                    {isDraft && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={handleSubmitApplication}
                          disabled={submitting}
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <CommentsSection
              comments={application.comments}
              onAddComment={handleAddComment}
              canReply={application.status !== 'Draft'}
            />
          </div>
          
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Company Information</h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm">{application.companyInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stellar Public Key</p>
                    <p className="text-sm font-mono text-xs truncate">{application.companyInfo.stellarPubkey}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-sm">{application.companyInfo.contact}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <p className="text-sm">
                      <a href={application.companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                        {application.companyInfo.website}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">SME Information</h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm">{application.smeInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registration Number</p>
                    <p className="text-sm">{application.smeInfo.regNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Jurisdiction</p>
                    <p className="text-sm">{application.smeInfo.jurisdiction}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <p className="text-sm">
                      <a href={application.smeInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                        {application.smeInfo.website}
                      </a>
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm whitespace-pre-line">{application.smeInfo.address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Investment Terms</h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Lot Price</p>
                    <p className="text-sm">${application.investmentTerms.lotPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Lots</p>
                    <p className="text-sm">{application.investmentTerms.totalLots}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Maximum Per Investor</p>
                    <p className="text-sm">{application.investmentTerms.maxPerInvestor} lots</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Minimum Period</p>
                    <p className="text-sm">{application.investmentTerms.minPeriod} months</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected Return</p>
                    <p className="text-sm">{application.investmentTerms.expectedReturn}%</p>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-xs text-gray-500">Use of Funds Breakdown</p>
                    <p className="text-sm">{application.investmentTerms.useOfFundsBreakdown}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 