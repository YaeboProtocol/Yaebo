import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { FileMetadata } from "../../lib/services/storage";
import { Button } from "./button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut 
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";

export interface DocumentViewerProps {
  file: FileMetadata;
  className?: string;
  onDownload?: () => void;
}

export function DocumentViewer({ file, className, onDownload }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const renderDocumentContent = () => {
    if (isImage) {
      return (
        <div 
          className={cn(
            "relative overflow-auto bg-checkerboard",
            isFullscreen ? "w-full h-full" : "w-full h-[500px]"
          )}
        >
          <img
            src={file.url}
            alt={file.name}
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-in-out'
            }}
            className="mx-auto my-0 max-w-full max-h-full object-contain"
          />
        </div>
      );
    } else if (isPdf) {
      return (
        <div 
          className={cn(
            "w-full bg-white",
            isFullscreen ? "h-full" : "h-[600px]"
          )}
        >
          <iframe
            src={`${file.url}#page=${currentPage}&zoom=${zoom * 100}`}
            title={file.name}
            className="w-full h-full border-0"
          />
        </div>
      );
    } else {
      // For unsupported file types
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Preview not available</h3>
          <p className="text-sm text-muted-foreground text-center mt-2 mb-6">
            This file type cannot be previewed. Please download to view.
          </p>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      );
    }
  };

  // Only show page controls for PDFs
  const showPageControls = isPdf;
  // Only show zoom controls for PDFs and images
  const showZoomControls = isPdf || isImage;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="bg-muted/30 p-2 rounded-t-lg flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium truncate">{file.name}</h3>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB • {file.type}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          {showZoomControls && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs mx-1">{Math.round(zoom * 100)}%</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] h-[95vh] p-1 flex flex-col">
              <div className="bg-muted/30 p-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">{file.name}</h3>
                <div className="flex items-center gap-1">
                  {showZoomControls && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.5}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-xs mx-1">{Math.round(zoom * 100)}%</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 bg-muted-foreground/5 overflow-hidden">
                {renderDocumentContent()}
              </div>
              {showPageControls && (
                <div className="p-2 flex items-center justify-center gap-2 bg-muted/30">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="border border-t-0 rounded-b-lg">
        {renderDocumentContent()}
      </div>
      
      {showPageControls && !isFullscreen && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm mx-2">Page {currentPage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
} 