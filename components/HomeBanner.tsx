import React from "react";
import { Title } from "./ui/text";
import Link from "next/link";
import Image from "next/image";
import { banner_1 } from "@/images";

const HomeBanner = () => {
  return (
    <div className="relative py-10 md:py-14 bg-gradient-to-r from-shop_light_pink to-pink-100 rounded-xl px-6 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-shop_dark_green/30"></div>
        <div className="absolute bottom-10 right-32 w-24 h-24 rounded-full bg-shop_dark_green/20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 order-2 md:order-1 text-center md:text-left max-w-lg">
        <span className="text-shop_dark_green font-medium mb-2 block">
          LIMITED TIME OFFER
        </span>
        <Title className="text-4xl md:text-4xl lg:text-6xl font-bold leading-tight mb-4">
          UP TO <span className="text-shop_dark_green">50% OFF</span> ON SELECTED ITEMS!
        </Title>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 mt-6 bg-shop_dark_green text-white px-8 py-3 rounded-lg text-md font-semibold hover:bg-shop_dark_green/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
        >
          Shop the Sale
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
      
      {/* Image */}
      <div className="relative z-10 order-1 md:order-2 transform hover:scale-105 transition-transform duration-500">
        <Image
          src={banner_1}
          alt="Luxury sale items"
          className="w-150 md:w-150 lg:w-130"
          priority
        />
      </div>
    </div>
  );
};

export default HomeBanner;