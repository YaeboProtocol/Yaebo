"use client";

import { useState } from "react";
import { 
  ManufacturerApplication, 
  ApplicationStatus,
  Document as AppDocument,
  Comment 
} from "@/types";
import { addComment, updateApplication } from "@/lib/mock-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock, Send, Paperclip, Download, Upload } from "lucide-react";
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

const STATUS_BADGES: Record<ApplicationStatus, { label: string, color: string, icon: React.ReactNode, bgColor: string }> = {
  "Draft": {
    label: "Draft",
    color: "text-slate-800",
    bgColor: "bg-slate-100",
    icon: <FileText className="w-4 h-4" />
  },
  "Submitted": {
    label: "Submitted",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
    icon: <Clock className="w-4 h-4" />
  },
  "Under Review": {
    label: "Under Review",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
    icon: <RefreshCw className="w-4 h-4" />
  },
  "Needs More Info": {
    label: "Needs More Info",
    color: "text-amber-800",
    bgColor: "bg-amber-100",
    icon: <AlertCircle className="w-4 h-4" />
  },
  "Accepted": {
    label: "Accepted",
    color: "text-green-800",
    bgColor: "bg-green-100",
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  "Rejected": {
    label: "Rejected",
    color: "text-red-800",
    bgColor: "bg-red-100",
    icon: <XCircle className="w-4 h-4" />
  }
};

interface ApplicationDetailProps {
  application: ManufacturerApplication;
  onStatusChange: (newStatus: ApplicationStatus) => void;
  onCreateProposal: () => void;
}

export function ApplicationDetail({ application, onStatusChange, onCreateProposal }: ApplicationDetailProps) {
  const [commentText, setCommentText] = useState("");
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(application.status);
  const [statusReason, setStatusReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleStatusChange = async () => {
    setSubmitting(true);
    try {
      await updateApplication(application.id, { status: newStatus });
      
      // Add a comment with the status change reason if provided
      if (statusReason.trim()) {
        await addComment(
          application.id, 
          `Status changed to ${newStatus}. ${statusReason}`, 
          [], 
          "Diligence"
        );
      }
      
      onStatusChange(newStatus);
      setStatusChangeDialogOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setSubmitting(false);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const DocumentLink = ({ document }: { document: AppDocument | null | undefined }) => {
    if (!document) return <span className="text-muted-foreground text-sm">Not provided</span>;
    
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
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
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
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${STATUS_BADGES[application.status].bgColor} ${STATUS_BADGES[application.status].color}`}>
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
                      <h3 className="text-sm font-medium text-muted-foreground">Company Information</h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Name</div>
                          <div className="font-medium">{application.companyInfo.name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Stellar Public Key</div>
                          <div className="font-mono text-sm truncate">{application.companyInfo.stellarPubkey}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Contact</div>
                          <div>{application.companyInfo.contact}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Website</div>
                          <a href={application.companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {application.companyInfo.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">SME Information</h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Name</div>
                          <div className="font-medium">{application.smeInfo.name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Registration Number</div>
                          <div>{application.smeInfo.regNumber}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Jurisdiction</div>
                          <div>{application.smeInfo.jurisdiction}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Address</div>
                          <div>{application.smeInfo.address}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Website</div>
                          <a href={application.smeInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
                        <h3 className="text-sm font-medium">Incorporation Certificate</h3>
                        <div className="mt-1">
                          <DocumentLink document={application.documents.incorporationCert} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Tax Certificate</h3>
                        <div className="mt-1">
                          <DocumentLink document={application.documents.taxCert} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Audited Financials</h3>
                        <div className="mt-1">
                          <DocumentLink document={application.documents.auditedFinancials} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Business Plan</h3>
                        <div className="mt-1">
                          <DocumentLink document={application.documents.businessPlan} />
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
                          <DocumentLink document={application.documents.useOfProceeds} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Risk Report</h3>
                        <div className="mt-1">
                          <DocumentLink document={application.documents.riskReport} />
                        </div>
                      </div>
                    </div>
                    
                    {application.documents.additionalDocs.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Additional Documents</h3>
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
                      <h3 className="text-sm font-medium text-muted-foreground">Investment Terms</h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Lot Price</div>
                          <div className="font-medium">${application.investmentTerms.lotPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Total Lots</div>
                          <div className="font-medium">{application.investmentTerms.totalLots}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Maximum Per Investor</div>
                          <div className="font-medium">{application.investmentTerms.maxPerInvestor} lots</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Minimum Period</div>
                          <div className="font-medium">{application.investmentTerms.minPeriod} months</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Expected Return</div>
                          <div className="font-medium">{application.investmentTerms.expectedReturn}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Use of Funds Breakdown</h3>
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
                        <h3 className="text-sm font-medium text-muted-foreground">Research Summary</h3>
                        <div className="mt-2 whitespace-pre-line">
                          {application.research.summary}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Key Metrics</h3>
                        <div className="mt-2 whitespace-pre-line">
                          {application.research.keyMetrics}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Risk Score</h3>
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                application.research.riskScore < 30 ? "bg-green-500" : 
                                application.research.riskScore < 70 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${application.research.riskScore}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-green-500">Low</span>
                            <span className="text-xs text-yellow-500">Medium</span>
                            <span className="text-xs text-red-500">High</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Projections</h3>
                        <div className="mt-2 whitespace-pre-line">
                          {application.research.projections}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Research Paper</h3>
                        <div className="mt-1">
                          {application.research.researchPaper ? (
                            <DocumentLink document={application.research.researchPaper} />
                          ) : (
                            <span className="text-muted-foreground text-sm">Not provided</span>
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
                      Research information will be available after initial review is completed.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="w-full md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Dialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start" variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Change Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Application Status</DialogTitle>
                      <DialogDescription>
                        Update the status of this application. This will notify the manufacturer.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">New Status</Label>
                        <Select
                          value={newStatus}
                          onValueChange={(value: string) => setNewStatus(value as ApplicationStatus)}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                            <SelectItem value="Needs More Info">Needs More Info</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Textarea
                          id="reason"
                          placeholder="Provide a reason for the status change"
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setStatusChangeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleStatusChange} disabled={submitting}>
                        {submitting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {application.status === "Accepted" && (
                  <Button className="w-full justify-start" onClick={onCreateProposal}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Proposal
                  </Button>
                )}
              </div>
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
                            <span className="font-medium text-sm">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm whitespace-pre-line">{comment.content}</div>
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
                    <p className="text-sm text-muted-foreground">No comments yet</p>
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
                    <Button variant="outline" size="sm" className="text-muted-foreground">
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