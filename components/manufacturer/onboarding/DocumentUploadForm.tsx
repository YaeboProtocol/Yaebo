import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentUploadFormValues, documentUploadSchema } from '@/lib/form-schemas';
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, File, XCircle, CheckCircle2, X } from "lucide-react";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";

interface DocumentUploadFormProps {
  defaultValues?: Partial<DocumentUploadFormValues>;
  onSubmit: (data: DocumentUploadFormValues) => void;
}

type FileWithPreview = File & {
  preview?: string;
};

export default function DocumentUploadForm({
  defaultValues,
  onSubmit,
}: DocumentUploadFormProps) {
  const [businessPlanFile, setBusinessPlanFile] = useState<FileWithPreview | null>(null);
  const [financialStatementsFile, setFinancialStatementsFile] = useState<FileWithPreview | null>(null);
  const [identificationDocsFile, setIdentificationDocsFile] = useState<FileWithPreview | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({
    businessPlan: false,
    financialStatements: false,
    identificationDocs: false,
  });

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: defaultValues || {
      businessPlan: null,
      financialStatements: null,
      identificationDocs: null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as FileWithPreview;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }

      // Set file state based on field
      if (field === 'businessPlan') {
        setBusinessPlanFile(file);
        form.setValue('businessPlan', file);
      } else if (field === 'financialStatements') {
        setFinancialStatementsFile(file);
        form.setValue('financialStatements', file);
      } else if (field === 'identificationDocs') {
        setIdentificationDocsFile(file);
        form.setValue('identificationDocs', file);
      }
      
      form.trigger(field as any);
    }
  };

  const removeFile = (field: 'businessPlan' | 'financialStatements' | 'identificationDocs') => {
    if (field === 'businessPlan') {
      if (businessPlanFile?.preview) {
        URL.revokeObjectURL(businessPlanFile.preview);
      }
      setBusinessPlanFile(null);
    } else if (field === 'financialStatements') {
      if (financialStatementsFile?.preview) {
        URL.revokeObjectURL(financialStatementsFile.preview);
      }
      setFinancialStatementsFile(null);
    } else if (field === 'identificationDocs') {
      if (identificationDocsFile?.preview) {
        URL.revokeObjectURL(identificationDocsFile.preview);
      }
      setIdentificationDocsFile(null);
    }
    
    form.setValue(field, null);
    form.trigger(field);
  };

  useEffect(() => {
    return () => {
      // Clean up preview URLs when component unmounts
      if (businessPlanFile?.preview) {
        URL.revokeObjectURL(businessPlanFile.preview);
      }
      if (financialStatementsFile?.preview) {
        URL.revokeObjectURL(financialStatementsFile.preview);
      }
      if (identificationDocsFile?.preview) {
        URL.revokeObjectURL(identificationDocsFile.preview);
      }
    };
  }, [businessPlanFile, financialStatementsFile, identificationDocsFile]);

  const handleSubmit = async (data: DocumentUploadFormValues) => {
    try {
      // Attach the file objects to the form data
      const formData = {
        ...data,
        businessPlan: businessPlanFile,
        financialStatements: financialStatementsFile,
        identificationDocs: identificationDocsFile,
      };
      await onSubmit(formData);
    } catch (error) {
      console.error('Error uploading documents:', error);
    }
  };

  const renderFilePreview = (file: FileWithPreview | null) => {
    if (!file) return null;
    
    if (file.preview) {
      return (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border">
          <Image
            src={file.preview}
            alt="File preview"
            className="object-cover"
            fill
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <File className="h-6 w-6 text-blue-500" />
        <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
      </div>
    );
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-8">
            {/* Business Plan */}
            <FormField
              control={form.control}
              name="businessPlan"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <FormLabel className="text-base font-medium">Business Plan</FormLabel>
                      <FormDescription>
                        Upload your business plan document (PDF format preferred)
                      </FormDescription>
                      <FormMessage />
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4">
                      {businessPlanFile ? (
                        <div className="w-full flex flex-col items-center space-y-2">
                          {renderFilePreview(businessPlanFile)}
                          <div className="flex items-center space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeFile('businessPlan')}
                              className="text-xs"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <label htmlFor="businessPlan" className="block">
                            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PDF or images</p>
                              </div>
                              <input
                                id="businessPlan"
                                type="file"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'businessPlan')}
                                disabled={uploading.businessPlan}
                                {...field}
                              />
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Financial Statements */}
            <FormField
              control={form.control}
              name="financialStatements"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <FormLabel className="text-base font-medium">Financial Statements</FormLabel>
                      <FormDescription>
                        Upload your financial statements for the past 1-3 years
                      </FormDescription>
                      <FormMessage />
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4">
                      {financialStatementsFile ? (
                        <div className="w-full flex flex-col items-center space-y-2">
                          {renderFilePreview(financialStatementsFile)}
                          <div className="flex items-center space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeFile('financialStatements')}
                              className="text-xs"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <label htmlFor="financialStatements" className="block">
                            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PDF or images</p>
                              </div>
                              <input
                                id="financialStatements"
                                type="file"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'financialStatements')}
                                disabled={uploading.financialStatements}
                                {...field}
                              />
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Identification Documents */}
            <FormField
              control={form.control}
              name="identificationDocs"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <FormLabel className="text-base font-medium">Identification Documents</FormLabel>
                      <FormDescription>
                        Upload identification documents for company directors
                      </FormDescription>
                      <FormMessage />
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4">
                      {identificationDocsFile ? (
                        <div className="w-full flex flex-col items-center space-y-2">
                          {renderFilePreview(identificationDocsFile)}
                          <div className="flex items-center space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeFile('identificationDocs')}
                              className="text-xs"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <label htmlFor="identificationDocs" className="block">
                            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PDF or images</p>
                              </div>
                              <input
                                id="identificationDocs"
                                type="file"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'identificationDocs')}
                                disabled={uploading.identificationDocs}
                                {...field}
                              />
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
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
                Uploading...
              </>
            ) : (
              'Upload Documents'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 