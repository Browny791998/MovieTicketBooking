"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useBookingStore } from "@/hooks/useBooking";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ShowtimeWithDetails } from "@/types";

interface BookingSummaryPanelProps {
  showtime: ShowtimeWithDetails;
}

export function BookingSummaryPanel({ showtime }: BookingSummaryPanelProps) {
  const router = useRouter();
  const { selectedSeats, totalAmount, setBookingId } = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = async () => {
    if (selectedSeats.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/bookings", {
        showtimeId: showtime.id,
        seatIds: selectedSeats.map((s) => s.seatId),
      });
      setBookingId(res.data.id);
      router.push("/booking/summary");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Failed to create booking");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <BookingSummary
        showtime={showtime}
        selectedSeats={selectedSeats}
        totalAmount={totalAmount}
        onConfirm={handleProceed}
        loading={loading}
        showConfirmButton={true}
      />
      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
