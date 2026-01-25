'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MultiStepForm from '@/components/manufacturer/onboarding/MultiStepForm';
import CompanyInfoForm from '@/components/manufacturer/onboarding/CompanyInfoForm';
import SMEInfoForm from '@/components/manufacturer/onboarding/SMEInfoForm';
import DocumentUploadForm from '@/components/manufacturer/onboarding/DocumentUploadForm';
import InvestmentTermsForm from '@/components/manufacturer/onboarding/InvestmentTermsForm';
import { CompanyInfoFormValues, SMEInfoFormValues, DocumentUploadFormValues, InvestmentTermsFormValues } from '@/lib/form-schemas';
import { createApplication, initMockData } from '@/lib/mock-service';
import { ManufacturerApplicationFormValues } from '@/lib/form-schemas';

export default function ManufacturerApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState<Partial<ManufacturerApplicationFormValues>>({
    companyInfo: {
      name: '',
      stellarPubkey: '',
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
    // Initialize mock data
    initMockData();
    setLoading(false);
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
      
      // Submit full application to backend
      const application = await createApplication(applicationData as ManufacturerApplicationFormValues);
      
      // Redirect to dashboard
      router.push(`/manufacturer/dashboard?applicationId=app-0`);
    } catch (error) {
      console.error('Error submitting application:', error);
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