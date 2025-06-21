// Example: /api/orders.ts
import { backendClient } from "@/sanity/lib/backendClient";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ orders: [] }), { status: 400 });
  }

  const orders = await backendClient.fetch(
    `*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc)`,
    { userId }
  );

  return new Response(JSON.stringify({ orders }), { status: 200 });
}
