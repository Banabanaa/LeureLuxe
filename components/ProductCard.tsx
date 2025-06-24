import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import PriceView from "./PriceView";
import Title from "./Title";
import ProductSideMenu from "./ProductSideMenu";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="text-sm border-[1px] rounded-md border-darkBlue/20 group bg-white">
      <div className="relative group overflow-hidden bg-shop_light_bg h-64">
        {product?.images && (
          <Link
            href={`/product/${product?.slug?.current}`}
            className="block relative w-full h-full"
          >
            {/* First image (default) */}
            <Image
              src={urlFor(product.images[0]).url()}
              alt="productImage"
              fill
              priority
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Second image (hover), if available */}
            {product.images[1] && (
              <Image
                src={urlFor(product.images[1]).url()}
                alt="productImageHover"
                fill
                priority
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </Link>
        )}
        <ProductSideMenu product={product} />
        {product?.status === "sale" ? (
          <p className="absolute top-2 left-2 z-10 text-xs border border-orange-500 bg-orange-100 px-3 rounded-full text-orange-700 group-hover:border-orange-600 hover:text-orange-800 hoverEffect">
            Sale!
          </p>
        ) : (
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 border border-shop_orange/50 p-1 rounded-full group-hover:border-shop_orange hover:text-shop_dark_green hoverEffect"
          >
            <Flame
              size={18}
              fill="#fb6c08"
              className="text-shop_orange/50 group-hover:text-shop_orange hoverEffect"
            />
          </Link>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2">
        {product?.categories && (
          <p className="uppercase line-clamp-1 text-xs font-medium text-lightText">
            {product.categories.map((cat) => cat).join(", ")}
          </p>
        )}
        <Title className="text-sm line-clamp-1">{product?.name}</Title>
        <div className="flex items-center gap-2.5">
          <p className="font-medium">In Stock</p>
          <p
            className={`${
              product?.stock === 0
                ? "text-red-600"
                : "text-shop_dark_green/80 font-semibold"
            }`}
          >
            {(product?.stock as number) > 0 ? product?.stock : "unavailable"}
          </p>
        </div>

        <PriceView
          price={product?.price}
          discount={product?.discount}
          className="text-sm"
        />
        <AddToCartButton product={product} className="w-36 rounded-full" />
      </div>
    </div>
  );
};

export default ProductCard;
