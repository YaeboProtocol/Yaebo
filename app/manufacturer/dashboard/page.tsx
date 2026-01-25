'use client';

import React, { useState, useEffect, Suspense  } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, ArrowLeft, Upload, FileUp, FilePlus, BarChart3, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { ManufacturerApplication, Document } from '@/types';
import { getApplication, addComment, addDocument, submitApplication, initMockData } from '@/lib/mock-service';
import ApplicationStatus from '@/components/manufacturer/dashboard/ApplicationStatus';
import DocumentList from '@/components/manufacturer/dashboard/DocumentList';
import CommentsSection from '@/components/manufacturer/dashboard/CommentsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function SuspenseWrapper() {
  return <Suspense fallback={<div>Loading...</div>}><ManufacturerDashboardPage /></Suspense>;
}


function ManufacturerDashboardPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId') || 'app-0';
  
  const [application, setApplication] = useState<ManufacturerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Calculate application completion percentage
  const calculateCompletionPercentage = (app: ManufacturerApplication): number => {
    let totalFields = 0;
    let completedFields = 0;
    
    // Company info
    if (app.companyInfo) {
      totalFields += 4; // name, stellarPubkey, contact, website
      if (app.companyInfo.name) completedFields += 1;
      if (app.companyInfo.stellarPubkey) completedFields += 1;
      if (app.companyInfo.contact) completedFields += 1;
      if (app.companyInfo.website) completedFields += 1;
    }
    
    // SME info
    if (app.smeInfo) {
      totalFields += 5; // name, regNumber, jurisdiction, address, website
      if (app.smeInfo.name) completedFields += 1;
      if (app.smeInfo.regNumber) completedFields += 1;
      if (app.smeInfo.jurisdiction) completedFields += 1;
      if (app.smeInfo.address) completedFields += 1;
      if (app.smeInfo.website) completedFields += 1;
    }
    
    // Investment terms
    if (app.investmentTerms) {
      totalFields += 5; // totalFundingAmount, investorSharePercentage, minPeriod, expectedReturn, useOfFundsBreakdown
      if (app.investmentTerms.totalFundingAmount) completedFields += 1;
      if (app.investmentTerms.investorSharePercentage) completedFields += 1;
      if (app.investmentTerms.minPeriod) completedFields += 1;
      if (app.investmentTerms.expectedReturn) completedFields += 1;
      if (app.investmentTerms.useOfFundsBreakdown) completedFields += 1;
    }
    
    // Documents (count key documents)
    totalFields += 3; // incorporationCert, taxCert, businessPlan
    if (app.documents.incorporationCert) completedFields += 1;
    if (app.documents.taxCert) completedFields += 1;
    if (app.documents.businessPlan) completedFields += 1;
    
    return Math.round((completedFields / totalFields) * 100);
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
            <Button asChild>
              <Link href="/manufacturer/apply">
                <Plus className="h-5 w-5 mr-2" />
                New Application
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const needsMoreInfo = application.status === 'Needs More Info';
  const isDraft = application.status === 'Draft';
  const canAddDocuments = needsMoreInfo || isDraft;
  const completionPercentage = calculateCompletionPercentage(application);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/manufacturer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
          {isDraft && (
            <Button 
              onClick={handleSubmitApplication}
              disabled={submitting || completionPercentage < 80}
              className="ml-auto"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Application Dashboard</h1>
          <p className="mt-2 text-gray-500">
            Track and manage your application for debt tokenization
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <ApplicationStatus status={application.status} updatedAt={application.updatedAt} />
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Application Completion</span>
                    <span className="text-sm font-medium text-blue-600">{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Application Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Application ID</p>
                    <p className="font-medium text-sm">{application.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="font-medium text-sm">{application.companyInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested Funding</p>
                    <p className="font-medium text-sm">${application.investmentTerms.totalFundingAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted On</p>
                    <p className="font-medium text-sm">
                      {application.status === 'Draft' 
                        ? 'Not yet submitted' 
                        : new Date(application.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileUp className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="communication">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Communication
              </TabsTrigger>
              <TabsTrigger value="details">
                <FilePlus className="h-4 w-4 mr-2" />
                Full Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Progress</CardTitle>
                  <CardDescription>Current status and next steps for your application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Company Information</h3>
                        <p className="text-sm text-gray-500">Basic company details and contact information</p>
                      </div>
                      <Badge 
                        variant={application.companyInfo ? "success" : "outline"}
                        className={application.companyInfo ? "bg-green-100 text-green-800" : ""}
                      >
                        {application.companyInfo ? "Complete" : "Incomplete"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">SME Details</h3>
                        <p className="text-sm text-gray-500">Legal entity information and registration details</p>
                      </div>
                      <Badge 
                        variant={application.smeInfo ? "success" : "outline"}
                        className={application.smeInfo ? "bg-green-100 text-green-800" : ""}
                      >
                        {application.smeInfo ? "Complete" : "Incomplete"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Investment Terms</h3>
                        <p className="text-sm text-gray-500">Funding request and return expectations</p>
                      </div>
                      <Badge 
                        variant={application.investmentTerms ? "success" : "outline"}
                        className={application.investmentTerms ? "bg-green-100 text-green-800" : ""}
                      >
                        {application.investmentTerms ? "Complete" : "Incomplete"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Required Documents</h3>
                        <p className="text-sm text-gray-500">Legal and financial documentation</p>
                      </div>
                      <Badge 
                        variant={application.documents.incorporationCert && application.documents.taxCert ? "success" : "outline"}
                        className={application.documents.incorporationCert && application.documents.taxCert ? "bg-green-100 text-green-800" : ""}
                      >
                        {application.documents.incorporationCert && application.documents.taxCert ? "Complete" : "Incomplete"}
                      </Badge>
                    </div>

                    {application.status === 'Draft' && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="font-medium mb-2">Ready to Submit?</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Once you submit your application, our diligence team will review it and may request additional information.
                        </p>
                        <Button 
                          onClick={handleSubmitApplication}
                          disabled={submitting || completionPercentage < 80}
                          className="w-full"
                        >
                          {submitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                        {completionPercentage < 80 && (
                          <p className="text-xs text-amber-600 mt-2">
                            Please complete more of your application before submitting.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <CommentsSection
                comments={application.comments}
                onAddComment={handleAddComment}
                canReply={application.status !== 'Draft'}
              />
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-6">
              <DocumentList documents={application.documents} />
              
              {canAddDocuments && (
                <Card>
                  <CardHeader>
                    <CardTitle>{needsMoreInfo ? 'Upload Additional Documents' : 'Upload Documents'}</CardTitle>
                    <CardDescription>
                      Provide any required documentation for your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Button
                            variant="outline"
                            className="w-full h-20 flex flex-col items-center justify-center"
                            asChild
                          >
                            <label>
                              <input
                                type="file"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (file) handleFileUpload('additionalDocs', file);
                                }}
                              />
                              <Upload className="h-6 w-6 mb-2" />
                              <span>Upload Document</span>
                            </label>
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            Upload any additional documents requested by the diligence team.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="communication" className="space-y-6">
              <CommentsSection
                comments={application.comments}
                onAddComment={handleAddComment}
                canReply={application.status !== 'Draft'}
              />
            </TabsContent>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Basic details about your company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium">{application.companyInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stellar Public Key</p>
                      <p className="text-sm font-mono text-xs truncate font-medium">{application.companyInfo.stellarPubkey}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-sm font-medium">{application.companyInfo.contact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="text-sm font-medium">
                        <a href={application.companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                          {application.companyInfo.website}
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>SME Information</CardTitle>
                  <CardDescription>Legal entity details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium">{application.smeInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Registration Number</p>
                      <p className="text-sm font-medium">{application.smeInfo.regNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Jurisdiction</p>
                      <p className="text-sm font-medium">{application.smeInfo.jurisdiction}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="text-sm font-medium">
                        <a href={application.smeInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                          {application.smeInfo.website}
                        </a>
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium whitespace-pre-line">{application.smeInfo.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Investment Terms</CardTitle>
                  <CardDescription>Funding request and return details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Funding Amount</p>
                      <p className="text-sm font-medium">${application.investmentTerms.totalFundingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Investor Profit Share</p>
                      <p className="text-sm font-medium">{application.investmentTerms.investorSharePercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Minimum Period</p>
                      <p className="text-sm font-medium">{application.investmentTerms.minPeriod} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expected Return</p>
                      <p className="text-sm font-medium">{application.investmentTerms.expectedReturn}%</p>
                    </div>
                    <div className="sm:col-span-3">
                      <p className="text-xs text-gray-500">Use of Funds Breakdown</p>
                      <p className="text-sm font-medium">{application.investmentTerms.useOfFundsBreakdown}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 