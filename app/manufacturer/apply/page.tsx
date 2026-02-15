'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MultiStepForm from '@/components/manufacturer/onboarding/MultiStepForm';
import CompanyInfoForm from '@/components/manufacturer/onboarding/CompanyInfoForm';
import SMEInfoForm from '@/components/manufacturer/onboarding/SMEInfoForm';
import DocumentUploadForm from '@/components/manufacturer/onboarding/DocumentUploadForm';
import InvestmentTermsForm from '@/components/manufacturer/onboarding/InvestmentTermsForm';
import { CompanyInfoFormValues, SMEInfoFormValues, DocumentUploadFormValues, InvestmentTermsFormValues } from '@/lib/form-schemas';
import { createApplication } from '@/lib/services/application-service-client';
import { ManufacturerApplicationFormValues } from '@/lib/form-schemas';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ManufacturerApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<{ id: string; status: string; createdAt: string } | null>(null);
  const [applicationData, setApplicationData] = useState<Partial<ManufacturerApplicationFormValues>>({
    companyInfo: {
      name: '',
      MantlePubkey: '',
      contact: '',
      website: '',
    },
    smeInfo: {
      name: '',
      regNumber: '',
      jurisdiction: '',
      address: '',
      website: '',
    },
    documents: {
      additionalDocs: [],
    },
    investmentTerms: {
      totalFundingAmount: 0,
      investorSharePercentage: 0,
      minPeriod: 12,
      expectedReturn: 15,
      useOfFundsBreakdown: 'Equipment (40%), Operations (30%), R&D (20%), Marketing (10%)',
    },
  });

  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Check if user already has an application
        const { data: existingApps, error } = await supabase
          .from('manufacturer_applications')
          .select('id, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking for existing application:', error);
          setLoading(false);
          return;
        }

        if (existingApps && existingApps.length > 0) {
          setExistingApplication({
            id: existingApps[0].id,
            status: existingApps[0].status,
            createdAt: existingApps[0].created_at,
          });
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingApplication();
  }, []);

  const handleCompanyInfoSubmit = (data: CompanyInfoFormValues) => {
    setApplicationData((prev) => ({
      ...prev,
      companyInfo: data,
    }));
  };

  const handleSMEInfoSubmit = (data: SMEInfoFormValues) => {
    setApplicationData((prev) => ({
      ...prev,
      smeInfo: data,
    }));
  };

  const handleDocumentUploadSubmit = (data: DocumentUploadFormValues) => {
    setApplicationData((prev) => ({
      ...prev,
      documents: data,
    }));
  };

  const handleInvestmentTermsSubmit = (data: InvestmentTermsFormValues) => {
    setApplicationData((prev) => ({
      ...prev,
      investmentTerms: data,
    }));
  };

  const handleFormCompletion = async () => {
    try {
      setLoading(true);
      
      console.log('Form completion started with data:', applicationData);
      
      // Validate that all required data is present
      const validationErrors: string[] = [];
      
      if (!applicationData.companyInfo?.name) {
        validationErrors.push('Company name is required');
      }
      if (!applicationData.smeInfo?.name) {
        validationErrors.push('SME name is required');
      }
      if (!applicationData.investmentTerms?.totalFundingAmount || applicationData.investmentTerms.totalFundingAmount <= 0) {
        validationErrors.push('Total funding amount is required');
      }
      
      if (validationErrors.length > 0) {
        console.error('Validation failed:', validationErrors);
        toast.error(`Please complete all required fields: ${validationErrors.join(', ')}`);
        setLoading(false);
        return;
      }
      
      console.log('Validation passed, creating application...');
      
      // Submit full application to Supabase
      const application = await createApplication(applicationData as ManufacturerApplicationFormValues);
      
      console.log('Application created:', application);
      toast.success('Application created successfully!');
      
      // Redirect to main manufacturer dashboard (no applicationId query param)
      router.push('/manufacturer/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create application. Please try again.';
      console.error('Error details:', {
        message: errorMessage,
        error: error,
      });
      
      // Check if it's a duplicate application error
      if (errorMessage.includes('already submitted an application')) {
        toast.error(errorMessage, {
          duration: 8000, // Show longer for important message
        });
        // Optionally redirect to dashboard to view existing application
        setTimeout(() => {
          router.push('/manufacturer/dashboard');
        }, 3000);
      } else {
        toast.error(errorMessage);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/70 mb-4"></div>
          <div className="h-4 w-40 bg-primary/50 rounded mb-3"></div>
          <div className="h-3 w-28 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show message if user already has an application
  if (existingApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-indigo-50/20 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-semibold">
              Application Already Submitted
            </AlertTitle>
            <AlertDescription className="text-amber-700 mt-2">
              <p className="mb-4">
                You have already submitted an application. Each user can only submit one application.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Application ID:</strong> {existingApplication.id}
                </p>
                <p>
                  <strong>Status:</strong> <span className="capitalize">{existingApplication.status}</span>
                </p>
                <p>
                  <strong>Submitted:</strong> {new Date(existingApplication.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => router.push('/manufacturer/dashboard')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  View My Application
                </Button>
                <Button
                  onClick={() => router.push('/manufacturer/dashboard')}
                  variant="outline"
                >
                  Go to Dashboard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: 'company-info',
      title: 'Company Information',
      content: (
        <CompanyInfoForm
          defaultValues={applicationData.companyInfo}
          onSubmit={handleCompanyInfoSubmit}
        />
      ),
    },
    {
      id: 'sme-info',
      title: 'SME Information',
      content: (
        <SMEInfoForm
          defaultValues={applicationData.smeInfo}
          onSubmit={handleSMEInfoSubmit}
        />
      ),
    },
    {
      id: 'documents',
      title: 'Document Upload',
      content: (
        <DocumentUploadForm
          defaultValues={applicationData.documents}
          onSubmit={handleDocumentUploadSubmit}
        />
      ),
    },
    {
      id: 'investment-terms',
      title: 'Investment Terms',
      content: (
        <InvestmentTermsForm
          defaultValues={applicationData.investmentTerms}
          onSubmit={handleInvestmentTermsSubmit}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-indigo-50/20 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Manufacturer Application
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Complete the following steps to submit your application for debt tokenization.
          </p>
        </div>

        <MultiStepForm steps={steps} onComplete={handleFormCompletion} />
      </div>
    </div>
  );
} 