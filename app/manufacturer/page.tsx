'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApplications, initMockData } from '@/lib/mock-service';
import { 
  ArrowRight, 
  FileText, 
  PlusCircle, 
  ClipboardList, 
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { ManufacturerApplication } from '@/types';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'Draft':
      return <ClipboardList className="h-6 w-6 text-gray-500" />;
    case 'Submitted':
      return <Clock className="h-6 w-6 text-blue-500" />;
    case 'Under Review':
      return <HelpCircle className="h-6 w-6 text-yellow-500" />;
    case 'Needs More Info':
      return <AlertCircle className="h-6 w-6 text-orange-500" />;
    case 'Accepted':
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case 'Rejected':
      return <XCircle className="h-6 w-6 text-red-500" />;
    default:
      return <FileText className="h-6 w-6 text-gray-500" />;
  }
};

export default function ManufacturerPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ManufacturerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        initMockData(); // Initialize mock data
        const apps = await getApplications();
        setApplications(apps);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      case 'Under Review': return 'bg-yellow-100 text-yellow-700';
      case 'Needs More Info': return 'bg-orange-100 text-orange-700';
      case 'Accepted': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-600/70 mb-4"></div>
          <div className="h-4 w-40 bg-blue-600/50 rounded mb-3"></div>
          <div className="h-3 w-28 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Manufacturer Dashboard
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Submit applications for debt tokenization and track their status
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 mb-12">
          <Card className="p-6 border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors">
            <div className="flex items-center">
              <div className="mr-6 bg-blue-100 p-3 rounded-full">
                <PlusCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Start a New Application</h2>
                <p className="text-gray-600 mt-1">
                  Begin the process to tokenize your manufacturing debt and raise funds
                </p>
              </div>
              <Link href="/manufacturer/apply" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Start Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your Applications
          </h2>

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Applications Yet</h3>
              <p className="mt-2 text-gray-500">
                Start by creating your first application to tokenize manufacturing debt.
              </p>
              <div className="mt-6">
                <Link
                  href="/manufacturer/apply"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  New Application
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {applications.map((app) => (
                <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{app.companyInfo.name}</CardTitle>
                        <CardDescription>
                          Created {new Date(app.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 my-2">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 w-1/3">Company:</span>
                        <span className="font-medium">{app.smeInfo.name || app.companyInfo.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 w-1/3">Contact:</span>
                        <span className="font-medium">{app.companyInfo.contact}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 w-1/3">Requested:</span>
                        <span className="font-medium">${(app.investmentTerms.lotPrice * app.investmentTerms.totalLots).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 w-1/3">Reg #:</span>
                        <span className="font-medium">{app.smeInfo.regNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 w-1/3">Jurisdiction:</span>
                        <span className="font-medium">{app.smeInfo.jurisdiction || 'Not provided'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center">
                        <StatusIcon status={app.status} />
                        <span className="ml-2 text-sm text-gray-600">
                          {app.status === 'Draft' ? 'Continue editing' : 
                           app.status === 'Needs More Info' ? 'Action required' : 
                           `Last updated: ${new Date(app.updatedAt).toLocaleDateString()}`}
                        </span>
                      </div>
                      <Link
                        href={`/manufacturer/dashboard?applicationId=${app.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600">
            Our team is ready to assist you with any questions about the application process or tokenizing your manufacturing debt.
          </p>
          <div className="mt-4">
            <a
              href="mailto:support@stdprotocol.com"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
