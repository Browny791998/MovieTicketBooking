"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PaymentFormProps {
  totalAmount: number;
  bookingId?: string;
}

export function PaymentForm({ totalAmount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirmation`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full h-12 text-base gap-2"
      >
        <Lock className="h-4 w-4" />
        {isLoading ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
      </Button>

      <p className="text-center text-xs text-zinc-500 flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Secured by Stripe. Your payment info is encrypted.
      </p>
    </form>
  );
}
