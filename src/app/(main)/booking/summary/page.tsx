"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useBookingStore } from "@/hooks/useBooking";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { ShowtimeWithDetails } from "@/types";
import { ArrowLeft } from "lucide-react";

export default function BookingSummaryPage() {
  const router = useRouter();
  const { bookingId, selectedSeats, totalAmount, setClientSecret } = useBookingStore();
  const [showtime, setShowtime] = useState<ShowtimeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      router.replace("/movies");
      return;
    }
    axios
      .get(`/api/bookings/${bookingId}`)
      .then((r) => setShowtime(r.data.showtime))
      .catch(() => router.replace("/movies"))
      .finally(() => setLoading(false));
  }, [bookingId, router]);

  const handlePayment = async (promoCode?: string) => {
    if (!bookingId) return;
    setProcessing(true);
    setError(null);
    try {
      const res = await axios.post("/api/payment/create-intent", {
        bookingId,
        promoCode: promoCode || undefined,
      });
      setClientSecret(res.data.clientSecret);
      router.push("/booking/payment");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.data?.code;
        if (code === "LOCK_EXPIRED") {
          setError("Your seat holds expired. Please reselect your seats.");
          setTimeout(() => router.replace("/movies"), 3000);
        } else {
          setError(err.response?.data?.error ?? "Failed to create payment");
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!showtime) return null;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to seat selection
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">Order Summary</h1>

      <BookingSummary
        showtime={showtime}
        selectedSeats={selectedSeats}
        totalAmount={totalAmount}
        bookingId={bookingId ?? undefined}
        onConfirm={handlePayment}
        loading={processing}
        showConfirmButton={true}
      />

      {error && (
        <div className="mt-4 rounded-lg bg-red-950/50 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
