"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { BookingWithDetails } from "@/types";
import { TicketModal } from "@/components/booking/TicketModal";
import { emitToast } from "@/hooks/useToast";
import {
  Calendar, Clock, MapPin, Ticket, XCircle,
  Send, RefreshCw, Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: BookingWithDetails;
  onCancelled?: (bookingId: string) => void;
}

const statusVariant = {
  CONFIRMED: "success" as const,
  PENDING: "warning" as const,
  CANCELLED: "destructive" as const,
};

export function BookingCard({ booking, onCancelled }: BookingCardProps) {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [resending, setResending] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const now = new Date();
  const showtime = new Date(booking.showtime.startTime);
  const isPast = showtime < now;
  const hoursUntil = (showtime.getTime() - now.getTime()) / 3600000;
  const isSoon = !isPast && hoursUntil < 24;
  const canCancel = (booking.status === "CONFIRMED" || booking.status === "PENDING") && !isPast;
  const seats = booking.bookingSeats
    .slice()
    .sort((a, b) => a.seat.rowLabel.localeCompare(b.seat.rowLabel) || a.seat.seatNumber - b.seat.seatNumber)
    .map((bs) => bs.seat);
  const seatList = seats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(", ");
  const bookingRef = "BOOK-" + booking.id.slice(0, 8).toUpperCase();

  const isCancelled = booking.status === "CANCELLED";

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await axios.delete(`/api/bookings/${booking.id}`);
      onCancelled?.(booking.id);
      emitToast({
        title: "Booking cancelled",
        description: "Your refund will be processed in 5–10 business days.",
        variant: "default",
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setCancelError(err.response?.data?.error ?? "Cancellation failed");
      }
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await axios.post(`/api/bookings/${booking.id}/resend-email`);
      emitToast({
        title: "Email sent",
        description: `Confirmation sent to ${booking.showtime.movie.title}.`,
        variant: "success",
      });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Failed to send email")
        : "Failed to send email";
      emitToast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors",
          booking.status === "CONFIRMED" && !isPast && "bg-zinc-900/90",
          isPast && booking.status === "CONFIRMED" && "opacity-75",
          isCancelled && "opacity-50"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Poster thumbnail */}
          {booking.showtime.movie.posterUrl && (
            <div className="shrink-0 w-14 h-20 rounded-md overflow-hidden bg-zinc-800 hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={booking.showtime.movie.posterUrl}
                alt={booking.showtime.movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-white truncate",
                    isCancelled && "line-through text-zinc-500"
                  )}
                >
                  {booking.showtime.movie.title}
                </h3>
                <p className="font-mono text-xs text-zinc-600 mt-0.5">{bookingRef}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSoon && (
                  <span className="animate-pulse text-xs font-semibold text-amber-400 border border-amber-700/40 bg-amber-950/40 rounded-full px-2 py-0.5">
                    Soon
                  </span>
                )}
                <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {formatDate(booking.showtime.startTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {formatTime(booking.showtime.startTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {booking.showtime.hall.theater.name} — {booking.showtime.hall.name}
              </span>
            </div>

            <div className="text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono text-zinc-200">{seatList}</span>
                <span className="text-zinc-600">({seats.length} seat{seats.length !== 1 ? "s" : ""})</span>
              </span>
            </div>

            {cancelError && <p className="text-xs text-red-400">{cancelError}</p>}
          </div>

          {/* Right column */}
          <div className="shrink-0 text-right space-y-2">
            <p className="font-bold text-red-400 text-base">{formatCurrency(booking.totalAmount)}</p>

            <div className="flex flex-col gap-1.5 items-end">
              {/* CONFIRMED actions */}
              {booking.status === "CONFIRMED" && (
                <>
                  <Button
                    size="sm"
                    variant={isPast ? "outline" : "default"}
                    className="gap-1.5 text-xs h-7"
                    onClick={() => setTicketOpen(true)}
                  >
                    <Ticket className="h-3 w-3" />
                    {isPast ? "View Ticket" : "View Ticket"}
                  </Button>

                  {!isPast && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs h-7 text-zinc-500 hover:text-white"
                      onClick={handleResendEmail}
                      disabled={resending}
                    >
                      {resending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Resend Email
                    </Button>
                  )}

                  {isPast && (
                    <Link href={`/movies/${booking.showtime.movie.id}`}>
                      <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-7 text-zinc-500 hover:text-white">
                        <Film className="h-3 w-3" />
                        Book Again
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* CANCELLED actions */}
              {isCancelled && (
                <Link href={`/movies/${booking.showtime.movie.id}`}>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-7 text-zinc-500 hover:text-white">
                    <Film className="h-3 w-3" />
                    Book Again
                  </Button>
                </Link>
              )}

              {/* Cancel flow */}
              {canCancel && !confirmCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs h-7 text-zinc-500 hover:text-red-400"
                  onClick={() => setConfirmCancel(true)}
                >
                  <XCircle className="h-3 w-3" />
                  Cancel
                </Button>
              )}

              {confirmCancel && (
                <div className="flex flex-col gap-1 items-end">
                  <p className="text-xs text-zinc-400">Cancel? Refund: {formatCurrency(booking.totalAmount)}</p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-7"
                      onClick={handleCancel}
                      disabled={cancelling}
                    >
                      {cancelling ? "..." : "Confirm"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => setConfirmCancel(false)}
                      disabled={cancelling}
                    >
                      Keep
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TicketModal
        booking={booking}
        open={ticketOpen}
        onOpenChange={setTicketOpen}
      />
    </>
  );
}
