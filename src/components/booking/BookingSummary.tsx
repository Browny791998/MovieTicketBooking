"use client";

import { useState } from "react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShowtimeWithDetails, SelectedSeat } from "@/types";
import { MapPin, Calendar, Clock, Film, Tag, CheckCircle2, X } from "lucide-react";
import axios from "axios";

interface BookingSummaryProps {
  showtime: ShowtimeWithDetails;
  selectedSeats: SelectedSeat[];
  totalAmount: number;
  bookingId?: string;
  onConfirm?: (promoCode?: string) => void;
  loading?: boolean;
  showConfirmButton?: boolean;
}

export function BookingSummary({
  showtime,
  selectedSeats,
  totalAmount,
  bookingId,
  onConfirm,
  loading = false,
  showConfirmButton = true,
}: BookingSummaryProps) {
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    description: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  const BOOKING_FEE = 2;
  const seatsTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const bookingFee = selectedSeats.length > 0 ? BOOKING_FEE : 0;
  const displayTotal = seatsTotal + bookingFee;

  const handleApplyPromo = async () => {
    if (!promoInput.trim() || !bookingId) return;
    setCheckingPromo(true);
    setPromoError(null);
    try {
      const res = await axios.post("/api/payment/promo", {
        code: promoInput.trim(),
        bookingId,
      });
      setPromoApplied({
        code: promoInput.trim().toUpperCase(),
        description: res.data.description,
        discountAmount: res.data.discountAmount,
        finalAmount: res.data.finalAmount,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setPromoError(err.response?.data?.error ?? "Invalid promo code");
      }
    } finally {
      setCheckingPromo(false);
    }
  };

  const finalAmount = promoApplied?.finalAmount ?? displayTotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5 text-red-400" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Movie info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-zinc-100">{showtime.movie.title}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(showtime.startTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(showtime.startTime)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            <MapPin className="h-3.5 w-3.5" />
            {showtime.hall.theater.name} — {showtime.hall.name}
          </div>
          <Badge variant="secondary">{showtime.hall.hallType}</Badge>
        </div>

        {/* Seats */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-sm font-medium text-zinc-300 mb-3">
            Selected Seats ({selectedSeats.length})
          </p>
          <div className="space-y-2">
            {selectedSeats.map((seat) => (
              <div key={seat.seatId} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-100">
                    {seat.rowLabel}{seat.seatNumber}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {seat.seatType.toLowerCase()}
                  </Badge>
                </div>
                <span className="text-zinc-300">{formatCurrency(seat.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Seats subtotal</span>
            <span>{formatCurrency(seatsTotal)}</span>
          </div>
          {bookingFee > 0 && (
            <div className="flex justify-between text-zinc-400">
              <span>Booking fee</span>
              <span>{formatCurrency(bookingFee)}</span>
            </div>
          )}
          {promoApplied && (
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {promoApplied.code}
              </span>
              <span>−{formatCurrency(promoApplied.discountAmount)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-zinc-800 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-zinc-100">Total</span>
            <div className="text-right">
              {promoApplied && (
                <p className="text-xs text-zinc-500 line-through">{formatCurrency(displayTotal)}</p>
              )}
              <span className="text-xl font-bold text-red-400">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Promo code */}
        {bookingId && (
          <div className="border-t border-zinc-800 pt-4">
            {promoApplied ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 border border-emerald-800/40 px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{promoApplied.code}</span>
                  <span className="text-emerald-600">— {promoApplied.description}</span>
                </div>
                <button
                  onClick={() => { setPromoApplied(null); setPromoInput(""); }}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                  className="uppercase text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyPromo}
                  disabled={checkingPromo || !promoInput.trim()}
                  className="shrink-0"
                >
                  {checkingPromo ? "..." : "Apply"}
                </Button>
              </div>
            )}
            {promoError && (
              <p className="text-xs text-red-400 mt-1.5">{promoError}</p>
            )}
          </div>
        )}

        {showConfirmButton && onConfirm && (
          <Button
            className="w-full mt-2"
            onClick={() => onConfirm(promoApplied?.code)}
            disabled={loading || selectedSeats.length === 0}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
