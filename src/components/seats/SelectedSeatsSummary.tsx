"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { SeatWithStatus, ShowtimeWithDetails } from "@/types";

const BOOKING_FEE = 2;

interface SelectedSeatsSummaryProps {
  selectedSeats: SeatWithStatus[];
  showtime: ShowtimeWithDetails;
  onProceed: () => void;
  isProceedLoading: boolean;
}

const seatTypeBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  STANDARD: "outline",
  PREMIUM: "secondary",
  RECLINER: "default",
};

export function SelectedSeatsSummary({
  selectedSeats,
  showtime,
  onProceed,
  isProceedLoading,
}: SelectedSeatsSummaryProps) {
  const seatsTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const total = seatsTotal + (selectedSeats.length > 0 ? BOOKING_FEE : 0);

  // Group by type for subtotal display
  const typeGroups = selectedSeats.reduce<Record<string, { count: number; subtotal: number }>>(
    (acc, s) => {
      if (!acc[s.seatType]) acc[s.seatType] = { count: 0, subtotal: 0 };
      acc[s.seatType].count++;
      acc[s.seatType].subtotal += s.price;
      return acc;
    },
    {}
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
      <h3 className="font-semibold text-zinc-100">
        Your Selection{" "}
        {selectedSeats.length > 0 && (
          <span className="text-zinc-400 font-normal text-sm">
            ({selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""})
          </span>
        )}
      </h3>

      {selectedSeats.length === 0 ? (
        <p className="text-sm text-zinc-500 py-4 text-center">
          Click on a seat to select it
        </p>
      ) : (
        <>
          {/* Seat list */}
          <div className="space-y-2">
            {selectedSeats
              .slice()
              .sort((a, b) => a.rowLabel.localeCompare(b.rowLabel) || a.seatNumber - b.seatNumber)
              .map((seat) => (
                <div
                  key={seat.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-100 w-8">
                      {seat.rowLabel}{seat.seatNumber}
                    </span>
                    <Badge variant={seatTypeBadgeVariant[seat.seatType] ?? "outline"} className="text-xs">
                      {seat.seatType.charAt(0) + seat.seatType.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <span className="text-zinc-300 tabular-nums">{formatPrice(seat.price)}</span>
                </div>
              ))}
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-1.5">
            {/* Type subtotals */}
            {Object.entries(typeGroups).map(([type, { count, subtotal }]) => (
              <div key={type} className="flex justify-between text-xs text-zinc-500">
                <span>{type.charAt(0) + type.slice(1).toLowerCase()} × {count}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Booking fee</span>
              <span>{formatPrice(BOOKING_FEE)}</span>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
            <span className="font-semibold text-zinc-100">Total</span>
            <span className="text-xl font-bold text-red-400 tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </>
      )}

      <Button
        className="w-full gap-2"
        size="lg"
        onClick={onProceed}
        disabled={selectedSeats.length === 0 || isProceedLoading}
      >
        {isProceedLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Proceed to Checkout
            {selectedSeats.length > 0 && (
              <span className="opacity-80">· {formatPrice(total)}</span>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
