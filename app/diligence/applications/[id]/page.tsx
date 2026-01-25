"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ManufacturerApplication, 
  ApplicationStatus 
} from "@/types";
import { getApplication } from "@/lib/mock-service";
import { ApplicationDetail } from "@/components/diligence/ApplicationDetail";
import { ProposalCreationForm } from "@/components/diligence/ProposalCreationForm";
import { useSorobanReact } from "@soroban-react/core";
import { useRegisteredContract } from "@soroban-react/contracts";

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const applicationId = id;  // Keep direct access for now as migration path
  console.log(applicationId);
  const [application, setApplication] = useState<ManufacturerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);

  const contract = useRegisteredContract("std");

  console.log("contract in page component:", contract);

  useEffect(() => {
    const loadApplication = async () => {
      setLoading(true);
      try {
        const data = await getApplication(applicationId);
        setApplication(data);
      } catch (error) {
        console.error("Failed to load application:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Application Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The application you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => router.push("/diligence")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => router.push("/diligence")}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{application.companyInfo.name}</h1>
          <p className="text-muted-foreground mt-1">
            Application review
          </p>
        </div>
        {application.status === "Accepted" && !showProposalForm && (
          <button
            onClick={() => setShowProposalForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create Proposal
          </button>
        )}
      </div>

      {showProposalForm ? (
        <ProposalCreationForm 
          application={application} 
          onCancel={() => setShowProposalForm(false)}
          onSuccess={() => router.push("/diligence")}
        />
      ) : (
        <ApplicationDetail 
          application={application}
          onStatusChange={(newStatus) => {
            setApplication(prev => prev ? { ...prev, status: newStatus } : null);
          }}
          onCreateProposal={() => setShowProposalForm(true)}
        />
      )}
    </div>
  );
} 