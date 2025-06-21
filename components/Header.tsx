// components/Header.tsx
"use client";

import Container from "./Container";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import CartIcon from "./CartIcon";
import FavoriteButton from "./FavoriteButton";
import SignIn from "./SignIn";
import MobileMenu from "./MobileMenu";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Logs } from "lucide-react";
import SyncClerkUser from "./SyncUserToSanity";
import React, { useEffect, useState } from "react";


export default function Header() {
  const { user, isSignedIn } = useUser();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
  if (!isSignedIn || !user) return;

  const userId = user.id;
  let isMounted = true;

  async function fetchOrders() {
    try {
      const res = await fetch(`/api/orders?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (isMounted) setOrdersCount(data.orders.length);
      } else {
        if (isMounted) setOrdersCount(0);
      }
    } catch {
      if (isMounted) setOrdersCount(0);
    }
  }

  fetchOrders();

  const intervalId = setInterval(fetchOrders, 1000); // every 1 second

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, [isSignedIn, user]);



  // You can fetch orders client-side here or do it server-side if needed
  // For now, let's skip orders for simplicity or add your orders fetch logic here

  return (
    <header className="sticky top-0 z-50 py-5 bg-white/70 backdrop-blur-md">
      <Container className="flex items-center justify-between text-lightColor">
        {/* Left side - Logo and Mobile Menu */}
        <div className="w-auto md:w-1/3 flex items-center gap-2.5 justify-start md:gap-0">
          <MobileMenu />
          <Logo />
        </div>

        {/* Middle - Header Menu */}
        <HeaderMenu />

        {/* Right side - Search, Cart, Wishlist, Orders, Auth */}
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
          {/* <SearchBar /> */}

          <div className="relative group">
            <CartIcon />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Cart
            </span>
          </div>

          <div className="relative group">
            <FavoriteButton />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Wishlist
            </span>
          </div>

          {isSignedIn && (
            <Link
              href={"/orders"}
              className="relative group hover:text-shop_light_green hoverEffect flex items-center"
            >
              <Logs />
              {/* Show order count here if you implement */}
              <span className="absolute -top-1 -right-1 bg-shop_btn_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
                {ordersCount}
              </span>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Orders
              </span>
            </Link>
          )}

          {isSignedIn && <SyncClerkUser />}

          {isSignedIn ? <UserButton /> : <SignIn />}
        </div>
      </Container>
    </header>
  );
}
