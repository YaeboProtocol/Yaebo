import React from 'react';
import { ApplicationStatus as StatusType } from '@/types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  HelpCircle, 
  FileCheck,
  Loader2
} from 'lucide-react';

interface ApplicationStatusProps {
  status: StatusType;
  updatedAt: string;
}

export default function ApplicationStatus({ status, updatedAt }: ApplicationStatusProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'Draft':
        return {
          icon: <Clock className="h-8 w-8 text-gray-400" />,
          color: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          label: 'Draft',
          description: 'Your application is in draft mode and has not been submitted yet.'
        };
      case 'Submitted':
        return {
          icon: <FileCheck className="h-8 w-8 text-yellow-500" />,
          color: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          label: 'Submitted',
          description: 'Your application has been submitted and is waiting for review.'
        };
      case 'Under Review':
        return {
          icon: <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />,
          color: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          label: 'Under Review',
          description: 'Your application is currently being reviewed by our diligence team.'
        };
      case 'Needs More Info':
        return {
          icon: <AlertCircle className="h-8 w-8 text-orange-500" />,
          color: 'bg-orange-50',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
          label: 'Needs More Info',
          description: 'Additional information is required to process your application.'
        };
      case 'Accepted':
        return {
          icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
          color: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          label: 'Accepted',
          description: 'Your application has been accepted! The DAO will now vote on your proposal.'
        };
      case 'Rejected':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          color: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          label: 'Rejected',
          description: 'Your application has been rejected. You may reapply after addressing the feedback.'
        };
      default:
        return {
          icon: <HelpCircle className="h-8 w-8 text-gray-400" />,
          color: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          label: 'Unknown',
          description: 'The status of your application is unknown.'
        };
    }
  };

  const config = getStatusConfig(status);
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`p-6 rounded-lg shadow-sm border ${config.borderColor} ${config.color}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="ml-4">
          <h3 className={`text-lg font-semibold ${config.textColor}`}>
            Application Status: {config.label}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{config.description}</p>
          <p className="mt-2 text-xs text-gray-500">
            Last updated: {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
} 