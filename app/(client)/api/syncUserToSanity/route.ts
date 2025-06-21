import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  useCdn: false,
  apiVersion: "2023-01-01",
  token: process.env.SANITY_API_TOKEN!,
});

interface SanityImage {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
}

interface SanityUser {
  _type: "user";
  _id?: string;
  clerkId: string;
  email: string;
  fullName: string;
  createdAt: string;
  profileImage?: SanityImage;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, firstName, lastName, profileImageUrl } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing Clerk userId" }, { status: 400 });
    }

    console.log("API: Syncing user:", userId);

    const existingUser = await sanityClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );

    if (existingUser) {
      console.log("User already exists in Sanity:", existingUser._id);

      if (
        profileImageUrl &&
        (!existingUser.profileImage ||
          existingUser.profileImage.asset?.url !== profileImageUrl)
      ) {
        const uploadedImage = await sanityClient.assets.upload(
          "image",
          await fetch(profileImageUrl).then((res) => res.blob())
        );

        const updatedUser = await sanityClient
          .patch(existingUser._id)
          .set({
            profileImage: {
              _type: "image",
              asset: {
                _type: "reference",
                _ref: uploadedImage._id,
              },
            },
          })
          .commit();

        console.log("Updated profile image for user:", updatedUser._id);
        return NextResponse.json(updatedUser);
      }

      return NextResponse.json(existingUser);
    }

    const newUser: SanityUser = {
      _type: "user",
      clerkId: userId,
      email: email || "",
      fullName: `${firstName || ""} ${lastName || ""}`.trim(),
      createdAt: new Date().toISOString(),
    };

    if (profileImageUrl) {
      const uploadedImage = await sanityClient.assets.upload(
        "image",
        await fetch(profileImageUrl).then((res) => res.blob())
      );

      newUser.profileImage = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: uploadedImage._id,
        },
      };
    }

    const createdUser = await sanityClient.createIfNotExists({
      ...newUser,
      _id: `user.${userId}`,
    });

    console.log("Created new user in Sanity:", createdUser._id);
    return NextResponse.json(createdUser);
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
