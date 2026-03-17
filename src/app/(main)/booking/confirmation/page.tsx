"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useBookingStore } from "@/hooks/useBooking";
import { QRTicket } from "@/components/booking/QRTicket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { CheckCircle2, Calendar, Clock, MapPin, Ticket, Home } from "lucide-react";
import { BookingWithDetails } from "@/types";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentIntentId = searchParams.get("payment_intent");
  const { clearBooking } = useBookingStore();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentIntentId) {
      router.replace("/movies");
      return;
    }
    axios
      .post("/api/payment/verify", { paymentIntentId })
      .then((r) => {
        setBooking(r.data.booking);
        clearBooking();
      })
      .catch(() => setError("Could not load booking details"))
      .finally(() => setLoading(false));
  }, [paymentIntentId, router, clearBooking]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-red-400">{error ?? "Booking not found"}</p>
        <Link href="/movies" className="mt-4 block">
          <Button>Browse Movies</Button>
        </Link>
      </div>
    );
  }

  const seats = booking.bookingSeats.map((bs) => bs.seat);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12 space-y-6">
      {/* Success header */}
      <div className="text-center space-y-3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/10 border border-emerald-600/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Booking Confirmed!</h1>
        <p className="text-zinc-400 text-sm">
          Your tickets have been sent to your email.
        </p>
      </div>

      {/* Booking details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600/20 to-red-700/10 border-b border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Booking ID</p>
          <p className="font-mono text-sm text-red-300 break-all">{booking.id}</p>
        </div>
        <div className="p-4 space-y-3">
          <h2 className="font-bold text-white text-lg">{booking.showtime.movie.title}</h2>
          <div className="space-y-2 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              {formatDate(booking.showtime.startTime)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              {formatTime(booking.showtime.startTime)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {booking.showtime.hall.theater.name} — {booking.showtime.hall.name}
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 shrink-0" />
              Seats:{" "}
              <span className="font-mono text-zinc-100">
                {seats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(", ")}
              </span>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
            <Badge variant="success">Confirmed</Badge>
            <span className="text-lg font-bold text-red-400">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-center font-semibold text-zinc-100 mb-4">Your Ticket QR</h3>
        <QRTicket
          bookingId={booking.id}
          userId={booking.userId}
          showtimeId={booking.showtimeId}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/profile" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <Ticket className="h-4 w-4" />
            My Bookings
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button className="w-full gap-2">
            <Home className="h-4 w-4" />
            Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-pulse rounded-full h-8 w-8 bg-red-600" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
