// components/SyncUserToSanity.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function SyncUserToSanity() {
  const { user } = useUser();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!user || hasSyncedRef.current) return;

    hasSyncedRef.current = true; // Lock it immediately
    console.log("Syncing user to Sanity:", user.id);

    fetch("/api/syncUserToSanity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.imageUrl,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to sync user");
        return response.json();
      })
      .then((data) => {
        console.log("Sync successful:", data);
      })
      .catch((error) => {
        console.error("Sync failed:", error);
        hasSyncedRef.current = false; // allow retry if needed
      });
  }, [user]);

  return null;
}
