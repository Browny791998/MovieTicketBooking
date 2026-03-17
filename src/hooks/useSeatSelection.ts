"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/hooks/useBooking";
import { emitToast } from "@/hooks/useToast";
import type { SeatWithStatus } from "@/types";

const POLL_INTERVAL = 15_000; // 15 seconds
const LOCK_TTL = 600;

interface UseSeatSelectionProps {
  showtimeId: string;
}

interface SeatsApiResponse {
  seats: SeatWithStatus[];
  showtime: { basePrice: number; hallType: string };
  summary: { total: number; available: number; booked: number; locked: number };
}

export function useSeatSelection({ showtimeId }: UseSeatSelectionProps) {
  const router = useRouter();
  const { setShowtime, addSeat, removeSeat, clearSeats, setBookingId } =
    useBookingStore();

  const [seats, setSeats] = useState<SeatWithStatus[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [isProceedLoading, setIsProceedLoading] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [seatData, setSeatData] = useState<SeatsApiResponse["showtime"] | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockStartRef = useRef<number | null>(null);
  const selectedIdsRef = useRef<Set<string>>(new Set());

  // Keep ref in sync
  useEffect(() => {
    selectedIdsRef.current = selectedSeatIds;
  }, [selectedSeatIds]);

  // Fetch seats from API and merge with selection state
  const fetchSeats = useCallback(async () => {
    try {
      const res = await axios.get<SeatsApiResponse>(
        `/api/showtimes/${showtimeId}/seats`
      );
      const { seats: freshSeats } = res.data;
      setSeatData(res.data.showtime);

      setSeats(freshSeats);

      // If any of our selected seats became BOOKED by someone else, deselect them
      const currentSelected = selectedIdsRef.current;
      const nowBooked = freshSeats
        .filter((s) => s.status === "BOOKED" && currentSelected.has(s.id))
        .map((s) => s);

      if (nowBooked.length > 0) {
        nowBooked.forEach((s) => {
          emitToast({
            title: "Seat taken",
            description: `Row ${s.rowLabel} Seat ${s.seatNumber} was just booked by another customer`,
            variant: "destructive",
          });
          removeSeat(s.id);
        });
        setSelectedSeatIds((prev) => {
          const next = new Set(prev);
          nowBooked.forEach((s) => next.delete(s.id));
          return next;
        });
      }
    } catch {
      // Silently fail on poll — don't disrupt user
    }
  }, [showtimeId, removeSeat]);

  // Initial load + restore locks
  useEffect(() => {
    setShowtime(showtimeId);

    const init = async () => {
      setIsLoading(true);
      await fetchSeats();

      // Restore any existing locks for this user
      try {
        const lockRes = await axios.get(
          `/api/seats/lock/bulk?showtimeId=${showtimeId}`
        );
        const { lockedSeats } = lockRes.data as {
          lockedSeats: { seatId: string; ttl: number }[];
        };

        if (lockedSeats.length > 0) {
          const ids = new Set(lockedSeats.map((l) => l.seatId));
          setSelectedSeatIds(ids);
          // Estimate remaining time from lowest TTL
          const minTtl = Math.min(...lockedSeats.map((l) => l.ttl));
          startCountdown(minTtl);
        }
      } catch {
        // No existing locks — fresh start
      }

      setIsLoading(false);
    };

    init();

    // Start polling
    const pollInterval = setInterval(fetchSeats, POLL_INTERVAL);

    // Release all locks on unmount / navigate away
    const releaseAll = () => {
      if (selectedIdsRef.current.size > 0) {
        // Use sendBeacon for beforeunload reliability
        navigator.sendBeacon(
          "/api/seats/lock/bulk",
          JSON.stringify({ showtimeId })
        );
      }
    };

    window.addEventListener("beforeunload", releaseAll);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("beforeunload", releaseAll);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showtimeId]);

  // Countdown timer
  function startCountdown(from = LOCK_TTL) {
    if (timerRef.current) clearInterval(timerRef.current);
    lockStartRef.current = Date.now() - (LOCK_TTL - from) * 1000;
    setLockTimeRemaining(from);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lockStartRef.current!) / 1000);
      const remaining = LOCK_TTL - elapsed;
      if (remaining <= 0) {
        setLockTimeRemaining(0);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setLockTimeRemaining(remaining);
        // Warn at 2 min remaining
        if (remaining === 120) {
          emitToast({
            title: "2 minutes left!",
            description: "Complete your booking before seats are released",
            variant: "default",
          });
        }
      }
    }, 1000);
  }

  function stopCountdown() {
    if (timerRef.current) clearInterval(timerRef.current);
    lockStartRef.current = null;
    setLockTimeRemaining(0);
  }

  const handleSeatClick = useCallback(
    async (seat: SeatWithStatus) => {
      if (seat.status === "BOOKED") return;
      if (seat.status === "LOCKED" && !seat.lockedByMe) return;
      if (lockingId) return;

      const isSelected = selectedSeatIds.has(seat.id);
      setLockingId(seat.id);

      if (isSelected) {
        // DESELECT — optimistic
        setSelectedSeatIds((prev) => {
          const next = new Set(prev);
          next.delete(seat.id);
          return next;
        });
        removeSeat(seat.id);

        try {
          await axios.delete("/api/seats/lock", {
            data: { showtimeId, seatId: seat.id },
          });

          // Stop timer if no seats left
          setSelectedSeatIds((prev) => {
            if (prev.size === 0) stopCountdown();
            return prev;
          });
        } catch {
          // Revert
          setSelectedSeatIds((prev) => new Set(Array.from(prev).concat(seat.id)));
          addSeat({
            seatId: seat.id,
            rowLabel: seat.rowLabel,
            seatNumber: seat.seatNumber,
            seatType: seat.seatType,
            price: seat.price,
          });
        }
      } else {
        // SELECT — optimistic
        setSelectedSeatIds((prev) => new Set(Array.from(prev).concat(seat.id)));

        try {
          await axios.post("/api/seats/lock", {
            showtimeId,
            seatId: seat.id,
          });

          addSeat({
            seatId: seat.id,
            rowLabel: seat.rowLabel,
            seatNumber: seat.seatNumber,
            seatType: seat.seatType,
            price: seat.price,
          });

          // Start countdown on first seat
          if (selectedSeatIds.size === 0) {
            startCountdown(LOCK_TTL);
          }
        } catch (err) {
          // Revert
          setSelectedSeatIds((prev) => {
            const next = new Set(prev);
            next.delete(seat.id);
            return next;
          });

          if (axios.isAxiosError(err) && err.response?.status === 409) {
            emitToast({
              title: "Seat just taken",
              description: `Row ${seat.rowLabel} Seat ${seat.seatNumber} was selected by another customer`,
              variant: "destructive",
            });
            // Refresh to show updated lock state
            fetchSeats();
          } else {
            emitToast({
              title: "Error",
              description: "Could not select seat. Please try again.",
              variant: "destructive",
            });
          }
        }
      }

      setLockingId(null);
    },
    [
      lockingId,
      selectedSeatIds,
      showtimeId,
      addSeat,
      removeSeat,
      fetchSeats,
    ]
  );

  const handleExpire = useCallback(() => {
    // Release all locks and clear selection
    axios
      .delete("/api/seats/lock/bulk", { data: { showtimeId } })
      .catch(() => {});
    setSelectedSeatIds(new Set());
    clearSeats();
    fetchSeats();
    emitToast({
      title: "Seats released",
      description: "Your seat hold expired. Please reselect your seats.",
      variant: "destructive",
    });
  }, [showtimeId, clearSeats, fetchSeats]);

  const proceedToCheckout = useCallback(async () => {
    if (selectedSeatIds.size === 0) return;
    setIsProceedLoading(true);

    try {
      const res = await axios.post("/api/bookings", {
        showtimeId,
        seatIds: Array.from(selectedSeatIds),
      });

      setBookingId(res.data.bookingId);
      router.push("/booking/summary");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.data?.code;
        if (code === "LOCK_EXPIRED") {
          emitToast({
            title: "Seat hold expired",
            description: "Please reselect your seats",
            variant: "destructive",
          });
          setSelectedSeatIds(new Set());
          clearSeats();
          fetchSeats();
        } else {
          emitToast({
            title: "Booking failed",
            description: err.response?.data?.error ?? "Please try again",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsProceedLoading(false);
    }
  }, [showtimeId, selectedSeatIds, setBookingId, router, clearSeats, fetchSeats]);

  // Derive selectedSeats array from seat list
  const selectedSeatsData = seats.filter((s) => selectedSeatIds.has(s.id));

  return {
    seats,
    isLoading,
    lockingId,
    selectedSeatIds,
    selectedSeats: selectedSeatsData,
    seatData,
    handleSeatClick,
    handleExpire,
    lockTimeRemaining,
    refreshSeats: fetchSeats,
    proceedToCheckout,
    isProceedLoading,
  };
}
