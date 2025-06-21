"use client";
import { Product } from "@/sanity.types";
import { useStore } from "@/store";
import { Heart } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

const FavoriteButton = ({
  showProduct = false,
  product,
}: {
  showProduct?: boolean;
  product?: Product | null | undefined;
}) => {
  const { user } = useUser();
  const {
    userWishlists,
    currentUserId,
    addToWishlist,
    removeFromWishlist,
  } = useStore();
  
  // Get current user's wishlist items
  const wishlistItems = currentUserId ? userWishlists[currentUserId] || [] : [];
  
  // Check if product is in wishlist
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  useEffect(() => {
    setIsInWishlist(
      product?._id ? wishlistItems.some(item => item._id === product._id) : false
    );
  }, [product?._id, wishlistItems]);

  const handleFavorite = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    
    if (!product?._id) return;
    if (!currentUserId) {
      toast.error("Please log in to manage your wishlist");
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success("Product removed from wishlist!");
    } else {
      addToWishlist(product);
      toast.success("Product added to wishlist!");
    }
  };

  return (
    <>
      {!showProduct ? (
        <Link href={"/wishlist"} className="group relative">
          <Heart className="w-5 h-5 hover:text-shop_light_green hoverEffect" />
          <span className="absolute -top-1 -right-1 bg-shop_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
            {wishlistItems.length || 0}
          </span>
        </Link>
      ) : (
        <button
          onClick={handleFavorite}
          className="group relative hover:text-shop_light_green hoverEffect border border-shop_light_green/80 hover:border-shop_light_green p-1.5 rounded-sm"
          disabled={!user}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? (
            <Heart
              fill="#3b9c3c"
              className="text-shop_light_green/80 group-hover:text-shop_light_green hoverEffect mt-.5 w-5 h-5"
            />
          ) : (
            <Heart className="text-shop_light_green/80 group-hover:text-shop_light_green hoverEffect mt-.5 w-5 h-5" />
          )}
        </button>
      )}
    </>
  );
};

export default FavoriteButton;