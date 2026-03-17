"use client";

import { useState } from "react";
import { ChevronUp, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { MobileSummarySheet } from "./MobileSummarySheet";
import type { SeatWithStatus, ShowtimeWithDetails } from "@/types";

interface MobileCheckoutBarProps {
  selectedSeats: SeatWithStatus[];
  showtime: ShowtimeWithDetails;
  onProceed: () => void;
  isProceedLoading: boolean;
}

const BOOKING_FEE = 200;

export function MobileCheckoutBar({
  selectedSeats,
  showtime,
  onProceed,
  isProceedLoading,
}: MobileCheckoutBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (selectedSeats.length === 0) return null;

  const total =
    selectedSeats.reduce((sum, s) => sum + s.price, 0) + BOOKING_FEE;

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm p-4 safe-area-inset-bottom">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-1 items-center gap-2 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-zinc-400">{formatPrice(total)} total</p>
            </div>
            <ChevronUp className="h-4 w-4 text-zinc-400 ml-auto" />
          </button>

          <button
            onClick={onProceed}
            disabled={isProceedLoading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {isProceedLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Proceed →"
            )}
          </button>
        </div>
      </div>

      <MobileSummarySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        selectedSeats={selectedSeats}
        showtime={showtime}
        onProceed={() => { setSheetOpen(false); onProceed(); }}
        isProceedLoading={isProceedLoading}
      />
    </>
  );
}
