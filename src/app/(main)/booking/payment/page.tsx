"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePromise } from "@/lib/stripe-client";
import { PaymentForm } from "@/components/booking/PaymentForm";
import { useBookingStore } from "@/hooks/useBooking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldCheck } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { clientSecret, bookingId, totalAmount } = useBookingStore();
  const [stripePromise] = useState(() => getStripePromise());

  useEffect(() => {
    if (!clientSecret || !bookingId) {
      router.replace("/movies");
    }
  }, [clientSecret, bookingId, router]);

  if (!clientSecret || !bookingId) return null;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12">
      <div className="mb-6 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10 border border-red-800/30 mb-3">
          <Lock className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Secure Payment</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Complete your booking for{" "}
          <span className="font-semibold text-red-400">${totalAmount.toFixed(2)}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#7c3aed",
                },
              },
            }}
          >
            <PaymentForm totalAmount={totalAmount} bookingId={bookingId} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
