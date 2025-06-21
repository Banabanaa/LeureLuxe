"use client";
import { cn } from "@/lib/utils";
import { Product } from "@/sanity.types";
import { useStore } from "@/store";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProductSideMenu = ({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) => {
  const { addToWishlist, removeFromWishlist, userWishlists, currentUserId } = useStore();
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Get current user's wishlist items
  const wishlistItems = currentUserId ? userWishlists[currentUserId] || [] : [];

  // Check if product is in wishlist
  useEffect(() => {
    setIsInWishlist(wishlistItems.some(item => item._id === product._id));
  }, [wishlistItems, product._id]);

  const handleFavorite = (e: React.MouseEvent<HTMLDivElement>) => {
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
    <div className={cn("absolute top-2 right-2 hover:cursor-pointer", className)}>
      <div
        onClick={handleFavorite}
        className={`p-2.5 rounded-full hover:bg-shop_dark_green/80 hover:text-white hoverEffect ${
          isInWishlist 
            ? "bg-shop_dark_green/80 text-white" 
            : "bg-lightColor/10"
        }`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          size={15} 
          fill={isInWishlist ? "currentColor" : "none"}
        />
      </div>
    </div>
  );
};

export default ProductSideMenu;