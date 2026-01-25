import React, { useState, useRef } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";
import { 
  AlertCircle, 
  Check, 
  File, 
  FileImage, 
  FileType, 
  FileText, 
  Upload,
  X
} from "lucide-react";
import { 
  ALLOWED_FILE_TYPES, 
  MAX_FILE_SIZE, 
  FileMetadata, 
  uploadFile, 
  validateFile 
} from "../../lib/services/storage";
import { toast } from "sonner";

export interface FileUploadProps {
  onUploadComplete?: (file: FileMetadata) => void;
  onError?: (error: string) => void;
  bucket: string;
  path: string;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: Record<string, string[]>;
  className?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  onUploadComplete,
  onError,
  bucket,
  path,
  maxFiles = 1,
  maxSize = MAX_FILE_SIZE,
  allowedTypes = ALLOWED_FILE_TYPES,
  className,
  label = "Upload Files",
  description = "Drag and drop files here or click to browse",
  ...props
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <FileImage className="h-5 w-5" />;
    } else if (type === 'application/pdf') {
      return <FileType className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Limit number of files
    if (files.length > maxFiles) {
      const errorMsg = `You can only upload ${maxFiles} file${maxFiles > 1 ? 's' : ''} at a time.`;
      setUploadError(errorMsg);
      onError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate the file
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file");
        onError?.(validation.error || "Invalid file");
        toast.error(validation.error || "Invalid file");
        continue;
      }

      // Proceed with upload
      try {
        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);

        // Mock progress updates (since we can't get real progress from the API easily)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 5;
          });
        }, 200);

        // Upload the file
        const uploadedFile = await uploadFile(file, bucket, path);
        
        // Complete the progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Notify parent component
        onUploadComplete?.(uploadedFile);
        
        // Show success toast
        toast.success(`File ${file.name} uploaded successfully`);
        
        // Reset after a moment
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      } catch (error) {
        const errorMsg = `Error uploading file: ${(error as Error).message}`;
        setUploadError(errorMsg);
        onError?.(errorMsg);
        toast.error(errorMsg);
        setIsUploading(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseError = () => {
    setUploadError(null);
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center", 
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
          isUploading && "pointer-events-none opacity-60"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          className="hidden"
          onChange={handleFileInputChange}
          accept={Object.keys(allowedTypes).join(',')}
        />
        
        <Upload className="h-10 w-10 text-primary" />
        <h3 className="text-lg font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {Object.values(allowedTypes).flat().join(', ')} files up to {Math.round(maxSize / (1024 * 1024))}MB
        </p>
      </div>

      {isUploading && (
        <div className="w-full mt-4">
          <div className="flex items-center gap-2 mb-2">
            <File className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-right mt-1 text-muted-foreground">
            {uploadProgress}%
          </p>
        </div>
      )}

      {uploadError && (
        <div className="w-full mt-4 bg-destructive/10 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">Upload Failed</p>
            <p className="text-xs text-destructive/90">{uploadError}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={handleCloseError}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface FilePreviewProps {
  file: FileMetadata;
  onDelete?: () => void;
  className?: string;
}

export function FilePreview({ file, onDelete, className }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 border rounded-md bg-background",
      className
    )}>
      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {isImage ? (
          file.thumbnailUrl ? 
            <img 
              src={file.thumbnailUrl} 
              alt={file.name}
              className="h-full w-full object-cover rounded-md"
            /> 
            : <FileImage className="h-5 w-5" />
        ) : isPdf ? (
          <FileType className="h-5 w-5" />
        ) : (
          <FileText className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          asChild
        >
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            <File className="h-4 w-4" />
          </a>
        </Button>
        
        {onDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 