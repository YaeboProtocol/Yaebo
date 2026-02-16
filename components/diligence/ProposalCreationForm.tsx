"use client";

import { useState } from "react";
import { ManufacturerApplication } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RefreshCw, FileText, DollarSign, Package, Users, Clock, Percent } from "lucide-react";
import { createProposal, getCurrentAddress, isDaoMember, connectWithMetamask } from "@/lib/utils/daoUtils";
import { checkEtherlinkNetwork, switchToEtherlinkNetwork } from "@/lib/utils/network";
import { updateApplication } from "@/lib/services/application-service-client";
import { toast } from "sonner";

interface ProposalCreationFormProps {
  application: ManufacturerApplication;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProposalCreationForm({ application, onCancel, onSuccess }: ProposalCreationFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    lotSize: application.investmentTerms.lotPrice?.toString() || "",
    sharePrice: "",
    maxPerInvestor: application.investmentTerms.maxPerInvestor?.toString() || "",
    summary: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if wallet is connected
      const address = await getCurrentAddress();
      if (!address) {
        toast.error("Please connect your wallet first");
        // Try to connect
        try {
          await connectWithMetamask();
          const newAddress = await getCurrentAddress();
          if (!newAddress) {
            setLoading(false);
            return;
          }
        } catch (error) {
          toast.error("Failed to connect wallet. Please connect manually.");
          setLoading(false);
          return;
        }
      }

      const isOnEtherlink = await checkEtherlinkNetwork();
      if (!isOnEtherlink) {
        toast.info("Please switch to Etherlink Shadownet network");
        try {
          await switchToEtherlinkNetwork();
          toast.success("Switched to Etherlink Shadownet network");
        } catch (switchError) {
          toast.error("Please manually switch to Etherlink Shadownet network in MetaMask");
          setLoading(false);
          return;
        }
      }

      // Check if user is a DAO member
      const currentAddress = await getCurrentAddress();
      if (currentAddress) {
        const memberStatus = await isDaoMember(currentAddress);
        if (!memberStatus) {
          toast.error("You must be a DAO member to create proposals. Please join the DAO first.");
          setLoading(false);
          return;
        }
      }

      // Parse and validate form values
      const lotSizeNum = parseFloat(form.lotSize);
      const sharePriceNum = parseFloat(form.sharePrice);
      const maxPerInvestorNum = parseFloat(form.maxPerInvestor);
      const proposalSummary = form.summary.trim();

      // Validate inputs
      if (isNaN(lotSizeNum) || lotSizeNum <= 0) {
        toast.error("Lot size must be a number greater than 0");
        setLoading(false);
        return;
      }
      if (isNaN(sharePriceNum) || sharePriceNum <= 0) {
        toast.error("Share price must be a number greater than 0");
        setLoading(false);
        return;
      }
      if (isNaN(maxPerInvestorNum) || maxPerInvestorNum <= 0) {
        toast.error("Maximum per investor must be a number greater than 0");
        setLoading(false);
        return;
      }
      if (!proposalSummary) {
        toast.error("Proposal summary is required");
        setLoading(false);
        return;
      }

      // Convert to integers (contract expects uint)
      const lotSize = Math.floor(lotSizeNum);
      const sharePrice = Math.floor(sharePriceNum);
      const maxPerInvestor = Math.floor(maxPerInvestorNum);

      toast.info("Creating proposal on blockchain...");

      // Call the contract function
      const tx = await createProposal(
        Number(lotSize),
        Number(sharePrice),
        Number(maxPerInvestor),
        proposalSummary
      );

      toast.success("Transaction submitted! Waiting for confirmation...");

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log("Proposal creation transaction receipt:", receipt);
      
      // Extract proposal ID from the transaction receipt or event logs
      // The contract returns the proposal ID, but we need to get it from the event
      let proposalId: number | null = null;
      
      if (receipt.logs) {
        // Try to find the proposalCreated event
        // This would require parsing the event logs, but for now we'll use a simpler approach
        // The contract emits proposalCreated(numProposal, msg.sender)
        // We can get the proposal count after the transaction
        try {
          // For now, we'll just show success
          // In a real implementation, you'd parse the event logs to get the proposal ID
          proposalId = receipt.blockNumber; // Temporary: using block number as identifier
        } catch (error) {
          console.error("Error extracting proposal ID:", error);
        }
      }

      toast.success(`Proposal created successfully! ${proposalId ? `Proposal ID: ${proposalId}` : ''}`);
      
      // Ensure the application status is marked as Accepted after proposal creation
      try {
        await updateApplication(application.id, { status: "Accepted" });
        console.log(`Application ${application.id} status set to Accepted after proposal creation`);
      } catch (statusError) {
        console.error("Failed to update application status to Accepted after proposal creation:", statusError);
        // Don't block user flow if this fails
      }
      
      // Call onSuccess callback
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create proposal:", error);
      
      // Extract error message
      let errorMessage = "Failed to create proposal";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create DAO Proposal</CardTitle>
        <CardDescription>
          Submit this application for DAO voting
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="bg-muted/40 p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">Application Summary</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Company</div>
                <div className="font-medium">{application.companyInfo.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Lots</div>
                <div className="font-medium">{application.investmentTerms.totalLots}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Expected Return</div>
                <div className="font-medium">{application.investmentTerms.expectedReturn}%</div>
              </div>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lotSize" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Lot Size
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="lotSize"
                    name="lotSize"
                    type="number"
                    placeholder="Enter lot size"
                    className="pl-9"
                    value={form.lotSize}
                    onChange={handleChange}
                    required
                  />
                </div>
                {application.investmentTerms.lotPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended to use existing lot price of ${application.investmentTerms.lotPrice.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="sharePrice" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Share Price
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="sharePrice"
                    name="sharePrice"
                    type="number"
                    placeholder="Enter share price"
                    className="pl-9"
                    value={form.sharePrice}
                    onChange={handleChange}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Price per individual share
                </p>
              </div>
              
              <div>
                <Label htmlFor="maxPerInvestor" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Maximum Per Investor
                </Label>
                <Input
                  id="maxPerInvestor"
                  name="maxPerInvestor"
                  type="number"
                  placeholder="Enter maximum lots per investor"
                  value={form.maxPerInvestor}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Suggested maximum: {application.investmentTerms.maxPerInvestor} lots per investor
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="summary" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Proposal Summary
                </Label>
                <Textarea
                  id="summary"
                  name="summary"
                  placeholder="Enter a summary of the proposal for DAO voters"
                  value={form.summary}
                  onChange={handleChange}
                  className="min-h-[120px]"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="bg-muted/40 p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">Proposal Preview</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-3 w-3 text-primary" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">Lot Size:</span> ${form.lotSize || "0"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-primary" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">Share Price:</span> ${form.sharePrice || "0"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-3 w-3 text-primary" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">Max Per Investor:</span> {form.maxPerInvestor || "0"} lots
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">Voting Period:</span> 7 days
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating Proposal...
              </>
            ) : (
              "Create Proposal"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 