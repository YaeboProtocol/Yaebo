"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ManufacturerApplication,
  ApplicationStatus,
  Document as AppDocument,
  Comment,
} from "@/types";
import {
  addComment,
  updateApplication,
  addResearchPaper,
} from "@/lib/services/application-service-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Send,
  Paperclip,
  Download,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import React, { useEffect } from "react";

// Mantle/Soroban contract functionality removed

const STATUS_BADGES: Record<
  ApplicationStatus,
  { label: string; color: string; icon: React.ReactNode; bgColor: string }
> = {
  Draft: {
    label: "Draft",
    color: "text-slate-800",
    bgColor: "bg-slate-100",
    icon: <FileText className="w-4 h-4" />,
  },
  Submitted: {
    label: "Submitted",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
    icon: <Clock className="w-4 h-4" />,
  },
  "Under Review": {
    label: "Under Review",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
    icon: <RefreshCw className="w-4 h-4" />,
  },
  "Needs More Info": {
    label: "Needs More Info",
    color: "text-amber-800",
    bgColor: "bg-amber-100",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  Accepted: {
    label: "Accepted",
    color: "text-green-800",
    bgColor: "bg-green-100",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-800",
    bgColor: "bg-red-100",
    icon: <XCircle className="w-4 h-4" />,
  },
};

interface ApplicationDetailProps {
  application: ManufacturerApplication;
  onStatusChange: (newStatus: ApplicationStatus) => void;
  onCreateProposal: () => void;
}

interface StatusChangeData {
  status: ApplicationStatus;
  reason?: string;
  researchPaper?: File | null;
}

export function ApplicationDetail({
  application,
  onStatusChange,
  onCreateProposal,
}: ApplicationDetailProps) {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<ApplicationStatus | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [researchPaper, setResearchPaper] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [acceptingApplication, setAcceptingApplication] = useState(false);

  // Mantle/Soroban removed - contract functionality disabled

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    setSubmitting(true);
    try {
      await updateApplication(application.id, { status: selectedStatus });

      // Add a comment with the status change reason if provided
      if (statusReason.trim()) {
        await addComment(
          application.id,
          `Status changed to ${selectedStatus}. ${statusReason}`,
          [],
          "Diligence"
        );
      }

      // Upload research paper if provided for Accepted status (non-blocking)
      if (selectedStatus === "Accepted" && researchPaper) {
        try {
          await addResearchPaper(application.id, researchPaper);
        } catch (error) {
          // Don't fail the status update if research paper upload fails
          console.error("Failed to upload research paper (non-critical):", error);
          // You could show a toast notification here if desired
        }
      }

      onStatusChange(selectedStatus);
      setStatusChangeDialogOpen(false);
      setSelectedStatus(null);
      setStatusReason("");
      setResearchPaper(null);

      // If status is Accepted, automatically redirect to proposal creation
      if (selectedStatus === "Accepted") {
        onCreateProposal();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusChangeDialog = (status: ApplicationStatus) => {
    setSelectedStatus(status);
    setStatusChangeDialogOpen(true);
  };

  // Handle accepting application directly without modal
  const handleAcceptApplication = async () => {
    if (application.status === "Accepted") {
      // Already accepted, just route to proposal creation
      onCreateProposal();
      return;
    }

    setAcceptingApplication(true);
    try {
      // Update status to Accepted
      await updateApplication(application.id, { status: "Accepted" });
      
      // Add a default comment
      await addComment(
        application.id,
        "Application has been accepted.",
        [],
        "Diligence"
      );

      onStatusChange("Accepted");
      
      // Route directly to proposal creation
      onCreateProposal();
    } catch (error) {
      console.error("Failed to accept application:", error);
    } finally {
      setAcceptingApplication(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(application.id, commentText, [], "Diligence");
      setCommentText("");
      // In a real app, we would update the comments list here
      // For this mockup, we'll just clear the input
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const DocumentLink = ({
    document,
  }: {
    document: AppDocument | null | undefined;
  }) => {
    if (!document)
      return (
        <span className="text-muted-foreground text-sm">Not provided</span>
      );

    return (
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <FileText className="h-4 w-4" />
        {document.name}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </a>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-2/3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Application Details</CardTitle>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                  STATUS_BADGES[application.status].bgColor
                } ${STATUS_BADGES[application.status].color}`}
              >
                {STATUS_BADGES[application.status].icon}
                {STATUS_BADGES[application.status].label}
              </div>
            </div>
            <CardDescription>
              Submitted on {formatDate(application.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="investment">Investment</TabsTrigger>
                <TabsTrigger value="research">Research</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Company Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Name
                          </div>
                          <div className="font-medium">
                            {application.companyInfo.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Mantle Public Key
                          </div>
                          <div className="font-mono text-sm truncate">
                            {application.companyInfo.MantlePubkey}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Contact
                          </div>
                          <div>{application.companyInfo.contact}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Website
                          </div>
                          <a
                            href={application.companyInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {application.companyInfo.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        SME Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Name
                          </div>
                          <div className="font-medium">
                            {application.smeInfo.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Registration Number
                          </div>
                          <div>{application.smeInfo.regNumber}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Jurisdiction
                          </div>
                          <div>{application.smeInfo.jurisdiction}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Address
                          </div>
                          <div>{application.smeInfo.address}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Website
                          </div>
                          <a
                            href={application.smeInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {application.smeInfo.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="pt-4">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">
                          Incorporation Certificate
                        </h3>
                        <div className="mt-1">
                          <DocumentLink
                            document={application.documents.incorporationCert}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Tax Certificate</h3>
                        <div className="mt-1">
                          <DocumentLink
                            document={application.documents.taxCert}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">
                          Audited Financials
                        </h3>
                        <div className="mt-1">
                          <DocumentLink
                            document={application.documents.auditedFinancials}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Business Plan</h3>
                        <div className="mt-1">
                          <DocumentLink
                            document={application.documents.businessPlan}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">KYC Documents</h3>
                        <div className="mt-1">
                          <DocumentLink document={application.documents.kyc} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Use of Proceeds</h3>
                        <div className="mt-1">
                          <DocumentLink
                            document={application.documents.useOfProceeds}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Risk Report</h3>
                        <div className="mt-1">
                          <DocumentLink
                            document={application.documents.riskReport}
                          />
                        </div>
                      </div>
                    </div>

                    {application.documents.additionalDocs.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">
                          Additional Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {application.documents.additionalDocs.map((doc) => (
                            <div key={doc.id}>
                              <DocumentLink document={doc} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="investment" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Investment Terms
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Funding Amount
                          </div>
                          <div className="font-medium">
                            $
                            {application.investmentTerms.totalFundingAmount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Investor Share
                          </div>
                          <div className="font-medium">
                            {
                              application.investmentTerms
                                .investorSharePercentage
                            }
                            %
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Expected Returns
                          </div>
                          <div className="font-medium">
                            {application.investmentTerms.expectedReturn}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Minimum Period
                          </div>
                          <div className="font-medium">
                            {application.investmentTerms.minPeriod} months
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Use of Funds Breakdown
                      </h3>
                      <div className="mt-2 whitespace-pre-line">
                        {application.investmentTerms.useOfFundsBreakdown}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="research" className="pt-4">
                {application.research ? (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Research Summary
                        </h3>
                        <div className="mt-2 whitespace-pre-line">
                          {application.research.summary}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Key Metrics
                        </h3>
                        <div className="mt-2 whitespace-pre-line">
                          {application.research.keyMetrics}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Risk Score
                        </h3>
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                application.research.riskScore < 30
                                  ? "bg-green-500"
                                  : application.research.riskScore < 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${application.research.riskScore}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-green-500">Low</span>
                            <span className="text-xs text-yellow-500">
                              Medium
                            </span>
                            <span className="text-xs text-red-500">High</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Projections
                        </h3>
                        <div className="mt-2 whitespace-pre-line">
                          {application.research.projections}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Research Paper
                        </h3>
                        <div className="mt-1">
                          {application.research.researchPaper ? (
                            <DocumentLink
                              document={application.research.researchPaper}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not provided
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Research Data</h3>
                    <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                      Research information will be available after initial
                      review is completed.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="w-full md:w-1/3 space-y-4">
          <Card className="border-2">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold cursor-pointer" onClick={() => setStatusChangeDialogOpen(true)}>Quick Actions</CardTitle>
                <div className={`w-2 h-2 rounded-full ${
                  application.status === "Under Review" ? "bg-purple-500 animate-pulse" :
                  application.status === "Needs More Info" ? "bg-amber-500 animate-pulse" :
                  application.status === "Accepted" ? "bg-green-500" :
                  application.status === "Rejected" ? "bg-red-500" :
                  "bg-blue-500"
                }`} />
              </div>
              <CardDescription className="mt-2">
                Change application status or request information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Dialog
                open={statusChangeDialogOpen}
                onOpenChange={setStatusChangeDialogOpen}
              >
                <div className="space-y-3">
                  {/* Review Actions */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Review Status
                    </h3>
                    
                    <Button
                      className={`w-full h-auto py-4 px-4 justify-start ${
                        application.status === "Under Review"
                          ? "bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-700"
                          : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200"
                      }`}
                      onClick={() => openStatusChangeDialog("Under Review")}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-lg ${
                          application.status === "Under Review" ? "bg-purple-700" : "bg-purple-200"
                        }`}>
                          <RefreshCw className={`h-5 w-5 ${
                            application.status === "Under Review" ? "text-white" : "text-purple-700"
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Mark Under Review</div>
                          <div className={`text-xs mt-0.5 ${
                            application.status === "Under Review" ? "text-purple-100" : "text-purple-600"
                          }`}>
                            Start reviewing this application
                          </div>
                        </div>
                        {application.status === "Under Review" && (
                          <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                        )}
                      </div>
                    </Button>

                    <Button
                      className={`w-full h-auto py-4 px-4 justify-start ${
                        application.status === "Needs More Info"
                          ? "bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-700"
                          : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-200"
                      }`}
                      onClick={() => openStatusChangeDialog("Needs More Info")}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-lg ${
                          application.status === "Needs More Info" ? "bg-amber-700" : "bg-amber-200"
                        }`}>
                          <AlertCircle className={`h-5 w-5 ${
                            application.status === "Needs More Info" ? "text-white" : "text-amber-700"
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Request More Info</div>
                          <div className={`text-xs mt-0.5 ${
                            application.status === "Needs More Info" ? "text-amber-100" : "text-amber-600"
                          }`}>
                            Ask manufacturer for additional details
                          </div>
                        </div>
                        {application.status === "Needs More Info" && (
                          <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                        )}
                      </div>
                    </Button>
                  </div>

                  {/* Decision Actions */}
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Final Decision
                    </h3>

                    <Button
                      className={`w-full h-auto py-4 px-4 justify-start ${
                        application.status === "Accepted"
                          ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-700"
                          : "bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200"
                      }`}
                      onClick={handleAcceptApplication}
                      disabled={acceptingApplication}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-lg ${
                          application.status === "Accepted" ? "bg-green-700" : "bg-green-200"
                        }`}>
                          <CheckCircle2 className={`h-5 w-5 ${
                            application.status === "Accepted" ? "text-white" : "text-green-700"
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">
                            {acceptingApplication ? "Accepting..." : "Accept Application"}
                          </div>
                          <div className={`text-xs mt-0.5 ${
                            application.status === "Accepted" ? "text-green-100" : "text-green-600"
                          }`}>
                            Approve and proceed to proposal creation
                          </div>
                        </div>
                        {application.status === "Accepted" && (
                          <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                        )}
                      </div>
                    </Button>

                    <Button
                      className={`w-full h-auto py-4 px-4 justify-start ${
                        application.status === "Rejected"
                          ? "bg-red-600 hover:bg-red-700 text-white border-2 border-red-700"
                          : "bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200"
                      }`}
                      onClick={() => openStatusChangeDialog("Rejected")}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-lg ${
                          application.status === "Rejected" ? "bg-red-700" : "bg-red-200"
                        }`}>
                          <XCircle className={`h-5 w-5 ${
                            application.status === "Rejected" ? "text-white" : "text-red-700"
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Reject Application</div>
                          <div className={`text-xs mt-0.5 ${
                            application.status === "Rejected" ? "text-red-100" : "text-red-600"
                          }`}>
                            Decline this application with reason
                          </div>
                        </div>
                        {application.status === "Rejected" && (
                          <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                        )}
                      </div>
                    </Button>
                  </div>
                </div>

                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedStatus === "Under Review" &&
                          "Mark as Under Review"}
                        {selectedStatus === "Needs More Info" &&
                          "Request More Information"}
                        {selectedStatus === "Accepted" && "Accept Application"}
                        {selectedStatus === "Rejected" && "Reject Application"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedStatus === "Under Review" &&
                          "This will notify the manufacturer that their application is being reviewed."}
                        {selectedStatus === "Needs More Info" &&
                          "Specify what additional information is needed from the manufacturer."}
                        {selectedStatus === "Accepted" &&
                          "This will approve the application and allow proposal creation."}
                        {selectedStatus === "Rejected" &&
                          "Please provide a reason for rejecting this application."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {selectedStatus === "Accepted" && (
                        <div className="grid gap-2">
                          <Label htmlFor="researchPaper">Research Paper (Optional)</Label>
                          <div className="flex items-center gap-2">
                            <input
                              id="researchPaper"
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                setResearchPaper(
                                  e.target.files ? e.target.files[0] : null
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                document
                                  .getElementById("researchPaper")
                                  ?.click()
                              }
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {researchPaper
                                ? researchPaper.name
                                : "Upload Research Paper"}
                            </Button>
                          </div>
                          <Label htmlFor="acceptReason">
                            Comments (required)
                          </Label>
                          <Textarea
                            id="acceptReason"
                            placeholder="Provide comments for accepting the application"
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      {selectedStatus === "Rejected" && (
                        <div className="grid gap-2">
                          <Label htmlFor="rejectReason">
                            Reason for Rejection (required)
                          </Label>
                          <Textarea
                            id="rejectReason"
                            placeholder="Provide a reason for rejecting the application"
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      {selectedStatus === "Needs More Info" && (
                        <div className="grid gap-2">
                          <Label htmlFor="moreInfoReason">
                            What Information is Needed? (required)
                          </Label>
                          <Textarea
                            id="moreInfoReason"
                            placeholder="Specify what additional information you need from the manufacturer"
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      {selectedStatus === "Under Review" && (
                        <p className="text-sm text-muted-foreground">
                          This will update the application status to Under
                          Review. No additional information is required.
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setStatusChangeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleStatusChange}
                        disabled={
                          submitting ||
                          (selectedStatus !== "Under Review" &&
                            !statusReason.trim())
                        }
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Update Status"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.comments.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {application.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {comment.user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm whitespace-pre-line">
                            {comment.content}
                          </div>
                          {comment.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {comment.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 py-1 px-2 bg-muted rounded text-xs font-medium hover:bg-muted/80"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {attachment.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No comments yet
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <Paperclip className="h-4 w-4 mr-1" />
                      Attach
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || submittingComment}
                    >
                      {submittingComment ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
