"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SelectedSeat } from "@/types";

interface BookingStore {
  showtimeId: string | null;
  selectedSeats: SelectedSeat[];
  bookingId: string | null;
  clientSecret: string | null;
  totalAmount: number;
  setShowtime: (showtimeId: string) => void;
  addSeat: (seat: SelectedSeat) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  setBookingId: (id: string) => void;
  setClientSecret: (secret: string) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      showtimeId: null,
      selectedSeats: [],
      bookingId: null,
      clientSecret: null,
      totalAmount: 0,

      setShowtime: (showtimeId) =>
        set({ showtimeId, selectedSeats: [], totalAmount: 0 }),

      addSeat: (seat) => {
        const { selectedSeats } = get();
        const newSeats = [...selectedSeats, seat];
        set({
          selectedSeats: newSeats,
          totalAmount: newSeats.reduce((sum, s) => sum + s.price, 0),
        });
      },

      removeSeat: (seatId) => {
        const { selectedSeats } = get();
        const newSeats = selectedSeats.filter((s) => s.seatId !== seatId);
        set({
          selectedSeats: newSeats,
          totalAmount: newSeats.reduce((sum, s) => sum + s.price, 0),
        });
      },

      clearSeats: () => set({ selectedSeats: [], totalAmount: 0 }),

      setBookingId: (bookingId) => set({ bookingId }),

      setClientSecret: (clientSecret) => set({ clientSecret }),

      clearBooking: () =>
        set({
          showtimeId: null,
          selectedSeats: [],
          bookingId: null,
          clientSecret: null,
          totalAmount: 0,
        }),
    }),
    {
      name: "cinema-booking",
      partialize: (state) => ({
        showtimeId: state.showtimeId,
        selectedSeats: state.selectedSeats,
        bookingId: state.bookingId,
        clientSecret: state.clientSecret,
        totalAmount: state.totalAmount,
      }),
    }
  )
);
