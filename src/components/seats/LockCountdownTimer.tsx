"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockCountdownTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  seatCount: number;
  onExpire: () => void;
}

export function LockCountdownTimer({
  totalSeconds,
  remainingSeconds,
  seatCount,
  onExpire,
}: LockCountdownTimerProps) {
  const hasWarnedRef = useRef(false);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (remainingSeconds <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire();
    }
    // Reset flags when timer resets
    if (remainingSeconds > 120) {
      hasWarnedRef.current = false;
    }
    if (remainingSeconds > 0) {
      hasExpiredRef.current = false;
    }
  }, [remainingSeconds, onExpire]);

  const pct = Math.max(0, (remainingSeconds / totalSeconds) * 100);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const isUrgent = remainingSeconds < 120;
  const isWarning = remainingSeconds >= 120 && remainingSeconds < 300;
  const isGood = remainingSeconds >= 300;

  const textColor = isUrgent ? "text-red-400" : isWarning ? "text-amber-400" : "text-green-400";
  const barColor = isUrgent ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-violet-500";
  const pulseClass = isUrgent ? "animate-pulse" : isWarning ? "animate-pulse [animation-duration:2s]" : "";

  if (remainingSeconds <= 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock className={cn("h-4 w-4 shrink-0", textColor, pulseClass)} />
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-lg font-bold tabular-nums", textColor)}>
              {timeStr}
            </span>
            <span className="text-xs text-zinc-500">remaining</span>
          </div>
          <p className="text-xs text-zinc-500">
            Holding {seatCount} seat{seatCount !== 1 ? "s" : ""} for you
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isUrgent && (
        <p className="text-xs text-red-400 text-center animate-pulse">
          Complete your booking before seats are released!
        </p>
      )}
    </div>
  );
}
