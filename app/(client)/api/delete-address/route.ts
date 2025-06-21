import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function DELETE(req: NextRequest) {
  try {
    const { addressId } = await req.json();

    if (!addressId) {
      return NextResponse.json(
        { error: "Missing address ID" },
        { status: 400 }
      );
    }

    const cleanId = addressId.replace(/^address\./, '');

    // First patch the user document to remove the reference
    const userQuery = `*[_type == "user" && references($addressId)][0]`;
    const userWithAddress = await client.fetch(userQuery, { addressId: cleanId });

    if (userWithAddress) {
      await client.patch(userWithAddress._id)
        .unset([`addresses[_ref=="${cleanId}"]`])
        .commit();
    }

    // Then delete the address
    await client.delete(cleanId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Full deletion error:", error);
    let errorMessage = "Failed to delete address";
    let stack: string | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      stack = process.env.NODE_ENV === "development" ? error.stack : undefined;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : undefined,
        stack
      },
      { status: 500 }
    );
  }
}