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
  discountCode?: string;
}

export interface GroupedCartItems {
  product: CartItem["product"];
  quantity: number;
}

const PRODUCTION_URL = 'https://leureluxe-e-commerce.vercel.app';

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata
) {
  try {
    // Validate input
    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }
    if (!metadata.customerEmail) {
      throw new Error("Customer email is required");
    }

    // Find or create customer
    const customers = await stripe.customers.list({
      email: metadata.customerEmail,
      limit: 1,
    });
    
    const customerId = customers?.data?.[0]?.id;
    const customerEmail = metadata.customerEmail;

    // Calculate discount
    const discountAmount = metadata.subtotalAmount - metadata.totalAmount;
    const discountRatio = discountAmount / metadata.subtotalAmount;

    // Prepare line items with proper error handling
    const line_items = items.map((item) => {
      if (!item.product.price) {
        throw new Error(`Product ${item.product._id} has no price`);
      }

      const itemPrice = item.product.price * (1 - discountRatio);
      
      return {
        price_data: {
          currency: "PHP",
          unit_amount: Math.round(itemPrice * 100),
          product_data: {
            name: item.product.name || "Unknown Product",
            description: item.product.description || undefined,
            metadata: { id: item.product._id },
            images: item.product.images?.length 
              ? [urlFor(item.product.images[0]).url()] 
              : undefined,
          },
        },
        quantity: item.quantity,
      };
    });

    // Prepare session metadata
    const sessionMetadata = {
      ...metadata,
      clerkUserId: metadata.clerkUserId || undefined,
      address: metadata.address ? JSON.stringify(metadata.address) : undefined,
      discountAmount: discountAmount.toString(),
      discountPercentage: `${Math.round(discountRatio * 100)}%`,
      itemsCount: items.length.toString(),
    };

    // Create checkout session
    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      invoice_creation: { enabled: true },
      line_items,
      metadata: {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        totalAmount: metadata.totalAmount.toString(),
        subtotalAmount: metadata.subtotalAmount.toString(),
        ...(metadata.clerkUserId && { clerkUserId: metadata.clerkUserId }),
        ...(metadata.address && { address: JSON.stringify(metadata.address) }),
        discountAmount: discountAmount.toString(),
        discountPercentage: `${Math.round(discountRatio * 100)}%`,
        itemsCount: items.length.toString(),
        ...(metadata.discountCode && { discountCode: metadata.discountCode }),
      },
      success_url: `${PRODUCTION_URL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
      cancel_url: `${PRODUCTION_URL}/cart`,
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      shipping_address_collection: {
        allowed_countries: ["PH"],
      },
      phone_number_collection: {
        enabled: true,
      },
    };

    // Apply customer details if available
    if (metadata.customerName) {
      sessionPayload.customer_update = {
        name: "auto",
      };
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    
    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return session.url;
  } catch (error) {
    console.error("Error in createCheckoutSession:", error);
    
    // Return user-friendly error messages
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Payment error: ${error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Checkout failed: ${error.message}`);
    }
    
    throw new Error("An unexpected error occurred during checkout");
  }
}