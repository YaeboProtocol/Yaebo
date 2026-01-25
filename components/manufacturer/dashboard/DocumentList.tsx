import React from 'react';
import Link from 'next/link';
import { DocumentUpload, Document } from '@/types';
import { CheckCircle2, File, FileText, FileX, Image as ImageIcon } from 'lucide-react';

interface DocumentListProps {
  documents: DocumentUpload;
}

export default function DocumentList({ documents }: DocumentListProps) {
  const documentMap = [
    { key: 'incorporationCert', label: 'Certificate of Incorporation', required: true },
    { key: 'taxCert', label: 'Tax Certificate', required: true },
    { key: 'auditedFinancials', label: 'Audited Financial Statements', required: false },
    { key: 'businessPlan', label: 'Business Plan', required: false },
    { key: 'kyc', label: 'KYC Documents', required: false },
    { key: 'useOfProceeds', label: 'Use of Proceeds Document', required: false },
    { key: 'riskReport', label: 'Risk Report', required: false },
  ] as const;

  const getDocumentIcon = (doc: Document | null | undefined) => {
    if (!doc) return <FileX className="h-5 w-5 text-red-400" />;
    
    if (doc.type.includes('pdf')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (doc.type.includes('image')) {
      return <ImageIcon className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {documentMap.map((item) => {
          const doc = documents[item.key];
          const isUploaded = !!doc;
          
          return (
            <li key={item.key} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="flex-shrink-0">
                  {getDocumentIcon(doc)}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.label}
                    {item.required && (
                      <span className="ml-1 text-red-500 text-xs">*</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {isUploaded ? doc.name : 'Not uploaded'}
                  </p>
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                {isUploaded ? (
                  <Link
                    href={doc.url}
                    target="_blank"
                    className="font-medium text-blue-600 hover:text-blue-500 text-sm inline-flex items-center"
                  >
                    View <span className="sr-only">{item.label}</span>
                  </Link>
                ) : (
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    item.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.required ? 'Required' : 'Optional'}
                  </span>
                )}
              </div>
            </li>
          );
        })}
        
        {documents.additionalDocs && documents.additionalDocs.length > 0 && (
          <>
            <li className="px-4 py-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700">Additional Documents</h4>
            </li>
            
            {documents.additionalDocs.map((doc) => (
              <li key={doc.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <div className="flex-shrink-0">
                    {getDocumentIcon(doc)}
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Added on {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <Link
                    href={doc.url}
                    target="_blank"
                    className="font-medium text-blue-600 hover:text-blue-500 text-sm"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
} 