import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InvestmentTermsFormValues, investmentTermsSchema } from '@/lib/form-schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, DollarSign, Percent, Info } from "lucide-react";
import { useStepCompletion } from './MultiStepForm';

interface InvestmentTermsFormProps {
  defaultValues?: Partial<InvestmentTermsFormValues>;
  onSubmit: (data: InvestmentTermsFormValues) => void;
}

export default function InvestmentTermsForm({
  defaultValues,
  onSubmit,
}: InvestmentTermsFormProps) {
  // Get step completion from context
  const { completeStep } = useStepCompletion();
  
  const form = useForm<InvestmentTermsFormValues>({
    resolver: zodResolver(investmentTermsSchema),
    defaultValues: defaultValues || {
      totalFundingAmount: 0,
      investorSharePercentage: 0,
      minPeriod: 0,
      expectedReturn: 0,
      useOfFundsBreakdown: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: InvestmentTermsFormValues) => {
    // Call the onSubmit function provided by the parent component
    await onSubmit(data);
    
    // Move to the next step - this is the last step, so it will trigger form completion
    completeStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Funding Structure</h3>
                  <p className="text-xs text-amber-700 mt-1">
                    The DAO will determine the specific funding structure, including lot size and pricing, 
                    after reviewing your application. You only need to specify your total funding needs and 
                    expected terms.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="totalFundingAmount"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Total Funding Amount Requested (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                          type="number"
                          placeholder="1000000" 
                          className="pl-8"
                          {...field}
                          value={value || ''}
                          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The total amount of funding you are seeking through the platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="investorSharePercentage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Investor Profit Share (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number"
                          step="0.1" 
                          placeholder="60.0" 
                          className="pr-8"
                          {...field}
                          value={value || ''}
                          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        />
                        <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Percentage of profits you're willing to share with investors
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minPeriod"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Minimum Period (Months)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="12" 
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      The minimum length of time for the investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expectedReturn"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number"
                          step="0.1" 
                          placeholder="15.0" 
                          className="pr-8"
                          {...field}
                          value={value || ''}
                          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        />
                        <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your estimate of annual returns from this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="useOfFundsBreakdown"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Use of Funds Breakdown</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Equipment (40%), Operations (30%), R&D (20%), Marketing (10%)" 
                        className="resize-none"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a breakdown of how the funds will be used. Include percentages for each category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Complete Application'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 