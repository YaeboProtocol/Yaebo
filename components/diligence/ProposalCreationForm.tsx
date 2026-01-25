"use client";

import { useState } from "react";
import { ManufacturerApplication } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RefreshCw, FileText, DollarSign, Package, Users, Clock, Percent } from "lucide-react";

interface ProposalCreationFormProps {
  application: ManufacturerApplication;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProposalCreationForm({ application, onCancel, onSuccess }: ProposalCreationFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    lotSize: application.investmentTerms.lotPrice.toString(),
    sharePrice: "",
    maxPerInvestor: application.investmentTerms.maxPerInvestor.toString(),
    summary: "",
    useOfFunds: application.investmentTerms.useOfFundsBreakdown
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, we would call an API to create the proposal
    // For this mock, we'll just simulate success
    onSuccess();
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
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended to use existing lot price of ${application.investmentTerms.lotPrice.toLocaleString()}
                </p>
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
              
              <div>
                <Label htmlFor="useOfFunds" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Use of Funds
                </Label>
                <Textarea
                  id="useOfFunds"
                  name="useOfFunds"
                  placeholder="Describe how the funds will be used"
                  value={form.useOfFunds}
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