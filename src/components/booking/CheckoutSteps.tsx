"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Seats", path: "/book/" },
  { label: "Summary", path: "/booking/summary" },
  { label: "Payment", path: "/booking/payment" },
  { label: "Confirmation", path: "/booking/confirmation" },
];

export function CheckoutSteps() {
  const pathname = usePathname();

  const currentIndex = STEPS.findLastIndex((s) => pathname.includes(s.path));

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  isDone
                    ? "border-red-600 bg-red-600 text-white"
                    : isActive
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-zinc-700 bg-zinc-900 text-zinc-500"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-white" : isDone ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-12 sm:w-16 mx-1 mb-5 transition-colors",
                  isDone ? "bg-red-600" : "bg-zinc-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
