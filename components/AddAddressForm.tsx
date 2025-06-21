"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Address } from "@/sanity.types";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddAddressFormProps {
  userId: string;
  onSuccess: (address: Address) => void;
}

export default function AddAddressForm({
  userId,
  onSuccess,
}: AddAddressFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    barangay: "",
    city: "",
    province: "",
    zip: "",
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      toast.error("User ID is missing");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/add-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create address");
      }

      const createdAddress = await response.json();

      onSuccess({
        _id: createdAddress._id,
        _type: "address",
        _createdAt: createdAddress._createdAt,
        _updatedAt: createdAddress._updatedAt,
        _rev: createdAddress._rev,
        ...formData,
      });

      setFormData({
        name: "",
        address: "",
        barangay: "",
        city: "",
        province: "",
        zip: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error adding address:", error);

      const message =
        error instanceof Error ? error.message : "Failed to add address";

      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name">Address Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={50}
          placeholder="e.g. Home, Office, Apartment"
        />
      </div>
      <div>
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="e.g. 123 JP Rizal St."
        />
      </div>
      <div>
        <Label htmlFor="barangay">Barangay</Label>
        <Input
          id="barangay"
          name="barangay"
          value={formData.barangay}
          onChange={handleChange}
          required
          placeholder="e.g. Barangay Mabuhay"
        />
      </div>
      <div>
        <Label htmlFor="city">City/Municipality</Label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="e.g. Bacoor"
        />
      </div>
      <div>
        <Label htmlFor="province">Province</Label>
        <Input
          id="province"
          name="province"
          value={formData.province}
          onChange={handleChange}
          required
          placeholder="e.g. Cavite"
        />
      </div>
      <div>
        <Label htmlFor="zip">ZIP Code</Label>
        <Input
          id="zip"
          name="zip"
          value={formData.zip}
          onChange={handleChange}
          required
          pattern="\d{4}"
          title="Please enter a valid 4-digit ZIP code"
          placeholder="e.g. 4102"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <Label htmlFor="default ">Set as default address</Label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Address"}
      </Button>
    </form>
  );
}
