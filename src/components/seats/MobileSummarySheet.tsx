"use client";

import * as Sheet from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { SelectedSeatsSummary } from "./SelectedSeatsSummary";
import type { SeatWithStatus, ShowtimeWithDetails } from "@/types";

interface MobileSummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSeats: SeatWithStatus[];
  showtime: ShowtimeWithDetails;
  onProceed: () => void;
  isProceedLoading: boolean;
}

export function MobileSummarySheet({
  open,
  onOpenChange,
  selectedSeats,
  showtime,
  onProceed,
  isProceedLoading,
}: MobileSummarySheetProps) {
  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Portal>
        <Sheet.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Sheet.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-zinc-800 bg-zinc-950 p-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300">
          {/* Handle */}
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-zinc-700" />

          <div className="flex items-center justify-between mb-4">
            <Sheet.Title className="text-base font-semibold text-white">
              Booking Summary
            </Sheet.Title>
            <Sheet.Close className="rounded-lg p-1 text-zinc-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </Sheet.Close>
          </div>

          <SelectedSeatsSummary
            selectedSeats={selectedSeats}
            showtime={showtime}
            onProceed={onProceed}
            isProceedLoading={isProceedLoading}
          />
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  );
}
