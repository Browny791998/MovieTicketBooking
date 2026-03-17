"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import type { SeatWithStatus } from "@/types";

interface SeatButtonProps {
  seat: SeatWithStatus;
  isSelected: boolean;
  isLocking: boolean;
  onClick: () => void;
  sizeClass?: string;
}

function getSeatClasses(
  seat: SeatWithStatus,
  isSelected: boolean,
  isLocking: boolean
): string {
  if (isLocking) return "bg-zinc-600 border-zinc-500 opacity-50 cursor-wait animate-pulse";

  // BOOKED — not available
  if (seat.status === "BOOKED") {
    return "bg-zinc-900 border-zinc-800 cursor-not-allowed opacity-30";
  }

  // LOCKED by someone else
  if (seat.status === "LOCKED" && !seat.lockedByMe) {
    return "bg-zinc-800 border-zinc-700 cursor-not-allowed opacity-50";
  }

  // SELECTED or locked by me
  if (isSelected || seat.lockedByMe) {
    return "bg-violet-600 border-2 border-violet-400 scale-110 text-white";
  }

  // AVAILABLE — color by seat type
  if (seat.seatType === "STANDARD") {
    return "bg-zinc-700 border-zinc-600 hover:bg-violet-500 hover:border-violet-400 hover:scale-105";
  }
  if (seat.seatType === "PREMIUM") {
    return "bg-blue-900 border-blue-700 hover:bg-blue-500 hover:border-blue-400 hover:scale-105";
  }
  // RECLINER
  return "bg-amber-900 border-amber-700 hover:bg-amber-500 hover:border-amber-400 hover:scale-105";
}

function getTooltipContent(seat: SeatWithStatus, isSelected: boolean) {
  const type = seat.seatType.charAt(0) + seat.seatType.slice(1).toLowerCase();
  const price = formatPrice(seat.price);

  if (seat.status === "BOOKED") {
    return (
      <div className="space-y-0.5">
        <div className="font-semibold">Row {seat.rowLabel} · Seat {seat.seatNumber}</div>
        <div className="text-zinc-400">Sold out</div>
      </div>
    );
  }
  if (seat.status === "LOCKED" && !seat.lockedByMe) {
    return (
      <div className="space-y-0.5">
        <div className="font-semibold">Row {seat.rowLabel} · Seat {seat.seatNumber}</div>
        <div className="text-amber-400">Held by another customer</div>
      </div>
    );
  }
  return (
    <div className="space-y-0.5">
      <div className="font-semibold">Row {seat.rowLabel} · Seat {seat.seatNumber}</div>
      <div className="text-zinc-300">{type} · {price}</div>
      {isSelected && <div className="text-violet-400 text-xs">Click to deselect</div>}
    </div>
  );
}

export const SeatButton = React.memo(function SeatButton({
  seat,
  isSelected,
  isLocking,
  onClick,
  sizeClass = "w-8 h-8",
}: SeatButtonProps) {
  const isDisabled =
    (seat.status === "BOOKED") ||
    (seat.status === "LOCKED" && !seat.lockedByMe) ||
    isLocking;

  const classes = getSeatClasses(seat, isSelected, isLocking);

  return (
    <Tooltip content={getTooltipContent(seat, isSelected)} side="top">
      <button
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        role="gridcell"
        aria-label={`Row ${seat.rowLabel} Seat ${seat.seatNumber}, ${
          isSelected ? "selected" : seat.status.toLowerCase()
        }, ${formatPrice(seat.price)}`}
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        className={cn(
          sizeClass,
          "rounded-t-lg rounded-b-sm border text-[9px] font-bold text-white",
          "transition-all duration-150 flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900",
          classes
        )}
      >
        {seat.seatNumber}
      </button>
    </Tooltip>
  );
});
