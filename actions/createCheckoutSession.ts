"use server";

import stripe from "@/lib/stripe";
import { Address } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { CartItem } from "@/store";
import Stripe from "stripe";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
  address?: Address | null;
  totalAmount: number; 
  subtotalAmount: number; 
}

export interface GroupedCartItems {
  product: CartItem["product"];
  quantity: number;
}

// Environment-aware URL generator
const getBaseUrl = () => {
  // Use Vercel's environment variable if available
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for production
  if (process.env.NODE_ENV === 'production') {
    return 'https://leureluxe-e-commerce.vercel.app';
  }
  // Default to localhost for development
  return 'http://localhost:3000';
};

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata
) {
  try {
    const customers = await stripe.customers.list({
      email: metadata.customerEmail,
      limit: 1,
    });
    const customerId = customers?.data?.length > 0 ? customers.data[0].id : "";

    // Calculate the discount amount
    const discountAmount = metadata.subtotalAmount - metadata.totalAmount;

    // Create line items
    const line_items = items.map((item) => {
      const discountRatio = discountAmount / metadata.subtotalAmount;
      const itemPrice = (item.product.price ?? 0) * (1 - discountRatio);
      
      return {
        price_data: {
          currency: "PHP",
          unit_amount: Math.round(itemPrice * 100),
          product_data: {
            name: item?.product?.name || "Unknown Product",
            description: item?.product?.description,
            metadata: { id: item?.product?._id },
            images:
              item?.product?.images && item?.product?.images?.length > 0
                ? [urlFor(item?.product?.images[0]).url()]
                : undefined,
          },
        },
        quantity: item?.quantity,
      };
    });

    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      metadata: {
        ...metadata,
        address: JSON.stringify(metadata.address),
        discountAmount: discountAmount.toString(),
      },
      mode: "payment",
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      invoice_creation: {
        enabled: true,
      },
      success_url: `${getBaseUrl()}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
      cancel_url: `${getBaseUrl()}/cart`,
      line_items,
    };

    if (customerId) {
      sessionPayload.customer = customerId;
    } else {
      sessionPayload.customer_email = metadata.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    return session.url;
  } catch (error) {
    console.error("Error creating Checkout Session", error);
    throw error;
  }
}