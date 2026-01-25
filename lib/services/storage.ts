import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize uploadthing client (fallback)
// Define allowed file types and their extensions
export const ALLOWED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type FileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
  uploadedBy?: string;
  entityId?: string; // Related entity ID (manufacturer, proposal, etc.)
  entityType?: string; // Type of entity (manufacturer, proposal, etc.)
  documentType?: string; // Type of document (business plan, financial statement, etc.)
};

/**
 * Validates a file against allowed types and size constraints
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${Object.values(ALLOWED_FILE_TYPES)
        .flat()
        .join(", ")}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

/**
 * Uploads a file to Supabase Storage or falls back to uploadthing
 */
export const uploadFile = async (
  file: File,
  bucket: string, 
  path: string,
  onProgress?: (progress: number) => void
): Promise<FileMetadata> => {
  try {
    // First try uploading to Supabase
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const fullPath = `${path}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload failed, falling back to uploadthing:", error);
      
      // Create a FormData for uploadthing (simpler API approach)
      // This bypasses the direct API call that's causing TypeScript issues
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify({ path: fullPath, bucket }));
      
      // Manual fetch to the uploadthing endpoint
      const uploadResponse = await fetch("/api/uploadthing", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error("UploadThing fallback failed");
      }
      
      const uploadResult = await uploadResponse.json();
      
      return {
        id: uploadResult.key || fullPath,
        name: file.name,
        size: file.size,
        type: file.type,
        url: uploadResult.url,
        createdAt: new Date(),
        entityId: path.split('/')[0],
        entityType: bucket,
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    // Generate thumbnail for images
    let thumbnailUrl;
    if (file.type.startsWith('image/')) {
      const { data: thumbData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath, {
          transform: {
            width: 100,
            height: 100,
            resize: 'contain',
          },
        });
      thumbnailUrl = thumbData.publicUrl;
    }

    return {
      id: data.path,
      name: file.name,
      size: file.size,
      type: file.type,
      url: urlData.publicUrl,
      thumbnailUrl,
      createdAt: new Date(),
      entityId: path.split('/')[0],
      entityType: bucket,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Error uploading file: ${(error as Error).message}`);
  }
};

/**
 * Deletes a file from storage
 */
export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    // First try Supabase
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Supabase delete failed, trying uploadthing:", error);
      
      // Use a more direct approach to avoid type issues
      await fetch(`/api/uploadthing/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileKey: path }),
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error(`Error deleting file: ${(error as Error).message}`);
  }
};

/**
 * Generates a signed URL for temporary access
 */
export const getSignedUrl = async (bucket: string, path: string, expiresIn = 60): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(error.message);
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error(`Error generating signed URL: ${(error as Error).message}`);
  }
};

/**
 * Retrieves files for a specific entity
 */
export const getFilesForEntity = async (
  bucket: string, 
  entityId: string, 
  entityType?: string
): Promise<FileMetadata[]> => {
  try {
    const path = entityType ? `${entityType}/${entityId}` : entityId;
    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) {
      throw new Error(error.message);
    }

    return data.map(item => {
      const fullPath = `${path}/${item.name}`;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);
      
      // Generate thumbnail URL for images
      let thumbnailUrl;
      if (item.metadata?.mimetype?.startsWith('image/')) {
        const { data: thumbData } = supabase.storage.from(bucket).getPublicUrl(fullPath, {
          transform: {
            width: 100,
            height: 100,
            resize: 'contain',
          },
        });
        thumbnailUrl = thumbData.publicUrl;
      }

      return {
        id: item.id || fullPath,
        name: item.name,
        size: item.metadata?.size || 0,
        type: item.metadata?.mimetype || 'application/octet-stream',
        url: urlData.publicUrl,
        thumbnailUrl,
        createdAt: new Date(item.created_at),
        entityId,
        entityType,
      };
    });
  } catch (error) {
    console.error("Error retrieving files:", error);
    throw new Error(`Error retrieving files: ${(error as Error).message}`);
  }
}; 