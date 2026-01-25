import { createRouteHandler } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { NextRequest, NextResponse } from "next/server";

const utapi = new UTApi();

// Create a file upload endpoint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const metadataStr = formData.get("metadata") as string;
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Upload the file using uploadthing
    const result = await utapi.uploadFiles([file]);
    
    if (!result || !result[0] || !("data" in result[0])) {
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      );
    }

    // Return the result with proper null checks
    const fileData = result[0].data;
    return NextResponse.json({
      key: fileData?.key || "unknown-key",
      url: fileData?.url || "",
      metadata,
    });
  } catch (error) {
    console.error("Error in upload route:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Delete file endpoint
export async function DELETE(request: NextRequest) {
  try {
    const json = await request.json();
    const { fileKey } = json;

    if (!fileKey) {
      return NextResponse.json(
        { error: "No file key provided" },
        { status: 400 }
      );
    }

    // Delete the file using uploadthing
    await utapi.deleteFiles([fileKey]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete route:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
} 