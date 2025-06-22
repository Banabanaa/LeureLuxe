"use client";

import {
  createCheckoutSession,
  Metadata,
} from "@/actions/createCheckoutSession";
import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceFormatter from "@/components/PriceFormatter";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Address } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import useStore from "@/store";
import { useAuth, useUser } from "@clerk/nextjs";
import { ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddAddressForm from "@/components/AddAddressForm";
import { Trash2 } from "lucide-react";

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubTotalPrice,
    resetCart,
  } = useStore();

  // Compute pricing values
  const originalPrice = getSubTotalPrice(); // price before discount
  const totalPrice = getTotalPrice(); // price after discount
  const discountAmount = originalPrice - totalPrice;

  const [loading, setLoading] = useState(false);
  const groupedItems = useStore((state) => state.getGroupedItems());
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Replace the current fetchAddresses declaration with this:
  const fetchAddresses = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available");
      return;
    }

    try {
      console.log("Fetching addresses for user:", user.id);

      const addressQuery = `*[_type == "address" && user._ref == $userRef]{
      _id,
      name,
      address,
      barangay,
      city,
      province,
      zip,
      isDefault,
      "userId": user._ref
    }`;

      const addressData = await client.fetch(addressQuery, {
        userRef: `user.${user.id}`,
      });

      console.log("Fetched addresses:", addressData);
      setAddresses(addressData || []);
    } catch (error) {
      console.error("Addresses fetching error:", error);
      toast.error("Failed to load addresses");
    }
  }, [user?.id]); // Add user.id as dependency

  // Then update your useEffect to include fetchAddresses in dependencies
  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchAddresses();
    }
  }, [isSignedIn, user?.id, fetchAddresses]);

  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem("selectedAddressId", selectedAddress._id);
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (addresses.length > 0) {
      const savedAddressId = localStorage.getItem("selectedAddressId");
      if (savedAddressId) {
        const savedAddress = addresses.find(
          (addr) => addr._id === savedAddressId
        );
        if (savedAddress) {
          setSelectedAddress(savedAddress);
          return;
        }
      }

      // Fallback to default or first address if no saved address
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddress || addresses[0]);
    }
  }, [addresses]);

  const handleResetCart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your cart?"
    );
    if (confirmed) {
      resetCart();
      toast.success("Cart reset successfully!");
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName ?? "Unknown",
        customerEmail: user?.emailAddresses[0]?.emailAddress ?? "Unknown",
        clerkUserId: user?.id ?? "",
        address: selectedAddress,
        totalAmount: getTotalPrice(), // Add this
        subtotalAmount: getSubTotalPrice(), // Add this
      };
      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  // Handle address addition
  const handleAddressAdded = (newAddress: Address) => {
    setAddresses((prev) => [newAddress, ...prev]);
    setSelectedAddress(newAddress);
    setIsDialogOpen(false);
    toast.success("Address added successfully!");
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/delete-address", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addressId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error Details:", data);
        throw new Error(
          data.error || data.details || "Failed to delete address"
        );
      }

      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));

      if (selectedAddress?._id === addressId) {
        const remaining = addresses.filter((addr) => addr._id !== addressId);
        setSelectedAddress(
          remaining.find((a) => a.isDefault) || remaining[0] || null
        );
      }

      toast.success("Address deleted successfully!");
    } catch (error: unknown) {
      console.error("Full deletion error:", error);
      let errorMessage = "Failed to delete address";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      {isSignedIn ? (
        <Container>
          {groupedItems?.length ? (
            <>
              <div className="flex items-center gap-2 py-5">
                <ShoppingBag className="text-darkColor" />
                <Title>Your Cart</Title>
              </div>
              <div className="grid lg:grid-cols-3 md:gap-8">
                <div className="lg:col-span-2 rounded-lg">
                  <div className="border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
                    {groupedItems?.map(({ product }) => {
                      const itemCount = getItemCount(product?._id);
                      return (
                        <div
                          key={product?._id}
                          className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                        >
                          <div className="flex flex-1 items-start gap-2 h-36 md:h-44">
                            {product?.images && (
                              <Link
                                href={`/product/${product?.slug?.current}`}
                                className="border p-0.5 md:p-1 mr-2 rounded-md
                                 overflow-hidden group"
                              >
                                <Image
                                  src={urlFor(product?.images[0]).url()}
                                  alt="productImage"
                                  width={300}
                                  height={300}
                                  loading="lazy"
                                  className="w-24 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 hoverEffect"
                                />
                              </Link>
                            )}
                            <div className="h-full flex flex-1 flex-col justify-between py-1">
                              <div className="flex flex-col gap-0.5 md:gap-1.5">
                                <h2 className="text-base font-semibold line-clamp-1">
                                  {product?.name}
                                </h2>
                                <div className="flex flex-col gap-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <span className="w-20 text-gray-500">
                                      Variant:
                                    </span>
                                    <span className="font-medium text-gray-800 capitalize">
                                      {product?.variant}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="w-20 text-gray-500">
                                      Status:
                                    </span>
                                    <span
                                      className={`font-medium capitalize ${
                                        product
                                          ? "text-amber-800"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {product?.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ProductSideMenu
                                        product={product}
                                        className="relative top-0 right-0"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold">
                                      Add to Favorite
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash
                                        onClick={() => {
                                          deleteCartProduct(product?._id);
                                          toast.success(
                                            "Product deleted successfully!"
                                          );
                                        }}
                                        className="w-4 h-4 md:w-5 md:h-5 mr-1 text-gray-500 hover:text-red-600 hoverEffect"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold bg-red-600">
                                      Delete product
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-start justify-between h-36 md:h-44 p-0.5 md:p-1">
                            <PriceFormatter
                              amount={(product?.price as number) * itemCount}
                              className="font-bold text-lg"
                            />
                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      onClick={handleResetCart}
                      className="m-5 font-semibold transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                      variant="destructive"
                    >
                      Reset Cart
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="lg:col-span-1">
                    <div className="hidden md:inline-block w-full bg-white p-6 rounded-lg border">
                      <h2 className="text-xl font-semibold mb-4">
                        Order Summary
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Original Price:</span>
                          <PriceFormatter amount={getSubTotalPrice()} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Discount:</span>
                          <div className="flex items-center gap-2">
                            <PriceFormatter amount={discountAmount} />
                            <span className="text-xs text-red-500 font-medium bg-red-100 px-2 py-0.5 rounded-full">
                              {Math.round(
                                (discountAmount / originalPrice) * 100
                              )}
                              % OFF
                            </span>
                          </div>
                        </div>

                        <Separator />
                        <div className="flex items-center justify-between font-semibold text-lg">
                          <span>Total Amount:</span>
                          <PriceFormatter
                            amount={getTotalPrice()}
                            className="text-lg font-bold text-black"
                          />
                        </div>
                        <Button
                          className="w-full rounded-lg font-bold tracking-wide hoverEffect"
                          size="lg"
                          disabled={loading || !selectedAddress}
                          onClick={handleCheckout}
                        >
                          {loading ? "Please wait..." : "Proceed to Checkout"}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-md mb-5">
                      <Card>
                        <CardHeader>
                          <CardTitle>Delivery Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {addresses.length > 0 ? (
                            <RadioGroup
                              value={selectedAddress?._id}
                              onValueChange={(value) => {
                                const address = addresses.find(
                                  (addr) => addr._id === value
                                );
                                if (address) setSelectedAddress(address);
                              }}
                            >
                              {addresses.map((address) => (
                                <div
                                  key={address._id}
                                  className={`flex items-center justify-between space-x-2 mb-4 cursor-pointer ${
                                    selectedAddress?._id === address._id &&
                                    "text-shop_dark_green"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 flex-1">
                                    <RadioGroupItem
                                      value={address._id}
                                      id={`address-${address._id}`}
                                    />
                                    <Label
                                      htmlFor={`address-${address._id}`}
                                      className="grid gap-1.5"
                                    >
                                      <span className="font-semibold">
                                        {address.name}
                                        {address.isDefault && (
                                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            Default
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-sm text-black/60">
                                        {address.address}, {address.city},{" "}
                                        {address.province} {address.zip}
                                      </span>
                                    </Label>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleDeleteAddress(address._id)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete Address"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <p className="text-gray-500 mb-4">No address yet</p>
                          )}

                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full mt-4">
                                {addresses.length > 0
                                  ? "Add New Address"
                                  : "Add Your First Address"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                              </DialogHeader>
                              <AddAddressForm
                                userId={user?.id || ""}
                                onSuccess={handleAddressAdded}
                              />
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Order summary for mobile view */}
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white pt-2">
                  <div className="bg-white p-4 rounded-lg border mx-4">
                    <h2>Order Summary</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>SubTotal</span>
                        <PriceFormatter amount={getSubTotalPrice()} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Discount</span>
                        <PriceFormatter
                          amount={getSubTotalPrice() - getTotalPrice()}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold text-lg">
                        <span>Total</span>
                        <PriceFormatter
                          amount={getTotalPrice()}
                          className="text-lg font-bold text-black"
                        />
                      </div>
                      <Button
                        className="w-full rounded-full font-semibold tracking-wide hoverEffect"
                        size="lg"
                        disabled={loading || !selectedAddress}
                        onClick={handleCheckout}
                      >
                        {loading ? "Please wait..." : "Proceed to Checkout"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      ) : (
        <NoAccess />
      )}
    </div>
  );
};

export default CartPage;
