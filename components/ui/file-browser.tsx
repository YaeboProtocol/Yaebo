import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { FileMetadata, deleteFile, getFilesForEntity } from "../../lib/services/storage";
import { FilePreview } from "./file-upload";
import { Button } from "./button";
import { Input } from "./input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Download,
  Filter,
  Loader2,
  Search,
  Trash2,
  X 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./dropdown-menu";
import { DocumentViewer } from "./document-viewer";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { toast } from "sonner";

export interface FileBrowserProps {
  bucket: string;
  entityId: string;
  entityType?: string;
  onFileSelect?: (file: FileMetadata) => void;
  onFileDelete?: (file: FileMetadata) => void;
  className?: string;
  emptyStateMessage?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  allowBulkOperations?: boolean;
}

type SortField = "name" | "size" | "type" | "createdAt";
type SortDirection = "asc" | "desc";

export function FileBrowser({
  bucket,
  entityId,
  entityType,
  onFileSelect,
  onFileDelete,
  className,
  emptyStateMessage = "No files found",
  showSearch = true,
  showFilters = true,
  allowBulkOperations = true
}: FileBrowserProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);

  // Load files
  useEffect(() => {
    loadFiles();
  }, [bucket, entityId, entityType]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...files];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(file => 
        file.name.toLowerCase().includes(query) || 
        file.type.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filterType) {
      result = result.filter(file => file.type.startsWith(filterType));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    setFilteredFiles(result);
  }, [files, searchQuery, sortField, sortDirection, filterType]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedFiles = await getFilesForEntity(bucket, entityId, entityType);
      setFiles(fetchedFiles);
    } catch (err) {
      console.error("Error loading files:", err);
      setError(`Failed to load files: ${(err as Error).message}`);
      toast.error(`Failed to load files: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilterByType = (type: string | null) => {
    setFilterType(type);
  };

  const handleFileSelect = (file: FileMetadata) => {
    onFileSelect?.(file);
    setPreviewFile(file);
  };

  const handleFileDelete = async (file: FileMetadata) => {
    try {
      await deleteFile(bucket, file.id);
      setFiles(files.filter(f => f.id !== file.id));
      onFileDelete?.(file);
      toast.success(`File "${file.name}" deleted successfully`);
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error(`Failed to delete file: ${(err as Error).message}`);
    }
  };

  const handleToggleSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      // Deselect all if all are selected
      setSelectedFiles([]);
    } else {
      // Select all
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedFiles.length) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedFiles.length} files?`);
    if (!confirmed) return;
    
    try {
      for (const fileId of selectedFiles) {
        await deleteFile(bucket, fileId);
      }
      
      setFiles(files.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
      toast.success(`${selectedFiles.length} files deleted successfully`);
    } catch (err) {
      console.error("Error deleting files:", err);
      toast.error(`Failed to delete files: ${(err as Error).message}`);
    }
  };

  const handleBulkDownload = () => {
    if (!selectedFiles.length) return;
    
    // For each selected file, trigger a download
    selectedFiles.forEach(fileId => {
      const file = files.find(f => f.id === fileId);
      if (file) {
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
    
    toast.success(`Downloading ${selectedFiles.length} files`);
  };

  const getUniqueFileTypes = () => {
    const types = new Set<string>();
    
    files.forEach(file => {
      const mainType = file.type.split('/')[0];
      types.add(mainType);
    });
    
    return Array.from(types);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    filterType && "bg-primary/10 border-primary/40"
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {filterType ? `Filter: ${filterType}` : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilterByType(null)}>
                  All Files
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {getUniqueFileTypes().map(type => (
                  <DropdownMenuItem 
                    key={type} 
                    onClick={() => handleFilterByType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sortDirection === "asc" ? <ArrowUp className="h-4 w-4 mr-2" /> : <ArrowDown className="h-4 w-4 mr-2" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => handleSort("name")}
                className="flex justify-between"
              >
                Name
                {sortField === "name" && (
                  sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSort("size")}
                className="flex justify-between"
              >
                Size
                {sortField === "size" && (
                  sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSort("type")}
                className="flex justify-between"
              >
                Type
                {sortField === "type" && (
                  sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSort("createdAt")}
                className="flex justify-between"
              >
                Date
                {sortField === "createdAt" && (
                  sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {allowBulkOperations && selectedFiles.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download ({selectedFiles.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedFiles.length})
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading files...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-destructive">Error loading files</h3>
            <p className="text-sm text-destructive/90">{error}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => loadFiles()}
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">{emptyStateMessage}</p>
        </div>
      )}
      
      {/* File list */}
      {!loading && !error && filteredFiles.length > 0 && (
        <div className="space-y-2">
          {allowBulkOperations && (
            <div className="p-2 border rounded-md bg-muted/10 flex items-center">
              <Checkbox
                checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                onCheckedChange={handleSelectAll}
                className="mr-3"
              />
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length === 0 
                  ? `Select all (${filteredFiles.length})` 
                  : `${selectedFiles.length} of ${filteredFiles.length} selected`}
              </span>
            </div>
          )}
          
          <div className="grid gap-2">
            {filteredFiles.map(file => (
              <div 
                key={file.id} 
                className="flex items-center"
              >
                {allowBulkOperations && (
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={() => handleToggleSelect(file.id)}
                    className="mr-3"
                  />
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex-1 cursor-pointer" onClick={() => handleFileSelect(file)}>
                      <FilePreview file={file} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-[95vw]">
                    <DocumentViewer file={file} />
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-destructive hover:bg-destructive/10"
                  onClick={() => handleFileDelete(file)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 