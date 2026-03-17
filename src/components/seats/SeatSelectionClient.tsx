"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SeatMap } from "@/components/seats/SeatMap";
import { SeatLegend } from "@/components/seats/SeatLegend";
import { LockCountdownTimer } from "@/components/seats/LockCountdownTimer";
import { SelectedSeatsSummary } from "@/components/seats/SelectedSeatsSummary";
import { MobileCheckoutBar } from "@/components/seats/MobileCheckoutBar";
import { ToastContainer } from "@/components/seats/ToastContainer";
import { useSeatSelection } from "@/hooks/useSeatSelection";
import { formatDate, formatTime } from "@/lib/utils";
import type { ShowtimeWithDetails } from "@/types";
import type { HallType } from "@prisma/client";

interface SeatSelectionClientProps {
  showtime: ShowtimeWithDetails;
}

export function SeatSelectionClient({ showtime }: SeatSelectionClientProps) {
  const {
    seats,
    isLoading,
    lockingId,
    selectedSeatIds,
    selectedSeats,
    handleSeatClick,
    handleExpire,
    lockTimeRemaining,
    proceedToCheckout,
    isProceedLoading,
  } = useSeatSelection({ showtimeId: showtime.id });

  return (
    <>
      <ToastContainer />

      {/* Skip to seat map for accessibility */}
      <a
        href="#seat-map"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-zinc-800 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to seat map
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Showtime info bar */}
        <div className="mb-6 flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="hidden sm:block relative w-12 h-16 rounded-lg overflow-hidden shrink-0">
            <Image
              src={showtime.movie.posterUrl}
              alt={showtime.movie.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-bold text-white text-base leading-tight">
                  {showtime.movie.title}
                </h1>
                <div className="flex flex-wrap gap-3 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(showtime.startTime)} · {formatTime(showtime.startTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {showtime.hall.theater.name} — {showtime.hall.name}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {showtime.hall.hallType}
              </Badge>
            </div>
          </div>
          <Link
            href={`/movies/${showtime.movieId}`}
            className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 self-center"
          >
            <ArrowLeft className="h-3 w-3" />
            Change
          </Link>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* LEFT: Seat map */}
          <div
            id="seat-map"
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-6"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 text-center">
              Select Your Seats
            </h2>

            <SeatMap
              seats={seats}
              selectedSeatIds={selectedSeatIds}
              onSeatClick={handleSeatClick}
              hallType={showtime.hall.hallType as HallType}
              isLoading={isLoading}
              lockingId={lockingId}
            />

            <SeatLegend />
          </div>

          {/* RIGHT: Summary panel (desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 sticky top-6">
            {lockTimeRemaining > 0 && (
              <LockCountdownTimer
                totalSeconds={600}
                remainingSeconds={lockTimeRemaining}
                seatCount={selectedSeatIds.size}
                onExpire={handleExpire}
              />
            )}

            <SelectedSeatsSummary
              selectedSeats={selectedSeats}
              showtime={showtime}
              onProceed={proceedToCheckout}
              isProceedLoading={isProceedLoading}
            />
          </div>
        </div>
      </div>

      {/* Mobile checkout bar (shown below md breakpoint) */}
      <MobileCheckoutBar
        selectedSeats={selectedSeats}
        showtime={showtime}
        onProceed={proceedToCheckout}
        isProceedLoading={isProceedLoading}
      />
    </>
  );
}
