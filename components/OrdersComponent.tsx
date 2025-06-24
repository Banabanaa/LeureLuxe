"use client";

import { Button } from "@/components/ui/button";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { createRefundRequest } from "@/sanity/queries";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersComponent({ orders, clerkUserId }) {
  const router = useRouter();

  const handleRefundRequest = async (orderId: string) => {
    try {
      const reason = prompt("Please enter the reason for your refund request:");
      if (reason === null) return; // User cancelled
      
      if (!reason.trim()) {
        alert("Please provide a reason for the refund");
        return;
      }

      const confirmed = confirm(
        "Are you sure you want to request a refund for this order?"
      );
      if (!confirmed) return;

      await createRefundRequest(orderId, clerkUserId, reason);
      alert("Refund request submitted successfully!");
      router.refresh();
    } catch (error) {
      alert("Failed to submit refund request");
      console.error(error);
    }
  };

  return (
    <TableBody>
      {orders.map((order) => (
        <TableRow key={order._id}>
          {/* ... other cells ... */}
          <TableCell>
            {order.refundRequested ? (
              <span className="capitalize">{order.refundStatus}</span>
            ) : (
              order.status
            )}
          </TableCell>
          <TableCell className="text-center">
            {!order.refundRequested && order.status !== "cancelled" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRefundRequest(order._id)}
                title="Request refund"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}