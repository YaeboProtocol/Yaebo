import React, { useState } from 'react';
import { X, FilePlus, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Document } from '@/types';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  existingFile?: Document | null;
  loading?: boolean;
  error?: string;
}

export function FileUpload({
  label,
  accept = "application/pdf,image/*",
  onChange,
  onRemove,
  existingFile,
  loading = false,
  error,
}: FileUploadProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
      onChange(selectedFile);
    } else {
      setFilePreview(null);
      onChange(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setFilePreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange(null);
    if (onRemove) {
      onRemove();
    }
  };

  const renderFilePreview = () => {
    // Use existing file url if provided
    const url = filePreview || (existingFile?.url || null);
    const fileType = file?.type || existingFile?.type || '';
    const fileName = file?.name || existingFile?.name || '';

    if (!url) return null;

    if (fileType.includes('image')) {
      return (
        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100">
          <Image
            src={url}
            alt={fileName}
            fill
            className="object-contain"
          />
        </div>
      );
    } else if (fileType.includes('pdf')) {
      return (
        <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden bg-gray-100 border border-gray-200">
          <iframe 
            src={url} 
            className="w-full h-full"
            title={fileName}
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
          <File className="h-8 w-8 text-blue-500 mr-3" />
          <span className="text-sm font-medium text-gray-700 truncate flex-1">
            {fileName}
          </span>
        </div>
      );
    }
  };

  const getFileIcon = () => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;
    if (file || existingFile) return <FileText className="h-5 w-5" />;
    return <FilePlus className="h-5 w-5" />;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      
      <div className="space-y-2">
        {renderFilePreview()}
        
        {(file || existingFile) && (
          <button 
            type="button" 
            onClick={handleRemove}
            className="inline-flex items-center text-xs text-red-600 hover:text-red-800 mb-2"
          >
            <X className="h-3 w-3 mr-1" />
            Remove file
          </button>
        )}

        <div className="relative">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <span className="mr-2">{getFileIcon()}</span>
            {file || existingFile ? 'Replace File' : 'Upload File'}
          </label>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
} 