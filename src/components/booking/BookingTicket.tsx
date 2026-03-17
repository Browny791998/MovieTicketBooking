"use client";

import Image from "next/image";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import type { BookingWithDetails } from "@/types";

interface BookingTicketProps {
  booking: BookingWithDetails;
  qrDataUrl: string | null;
}

const HALL_TYPE_LABEL: Record<string, string> = {
  IMAX: "IMAX",
  FOURDX: "4DX",
  STANDARD: "Standard",
};

const SEAT_TYPE_COLOR: Record<string, string> = {
  STANDARD: "#3f3f46",
  PREMIUM: "#7c3aed",
  RECLINER: "#0e7490",
};

export function BookingTicket({ booking, qrDataUrl }: BookingTicketProps) {
  const { showtime, bookingSeats } = booking;
  const movie = showtime.movie;
  const hall = showtime.hall;
  const theater = hall.theater;
  const bookingRef = "BOOK-" + booking.id.slice(0, 8).toUpperCase();
  const hallLabel = HALL_TYPE_LABEL[hall.hallType] ?? hall.hallType;

  const sortedSeats = [...bookingSeats].sort((a, b) =>
    a.seat.rowLabel.localeCompare(b.seat.rowLabel) || a.seat.seatNumber - b.seat.seatNumber
  );

  return (
    <div
      className="printable-ticket bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg mx-auto"
      style={{ fontFamily: "Inter, Arial, sans-serif" }}
    >
      {/* TOP STRIP */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: "#dc2626" }}
      >
        <span className="text-white font-black text-lg tracking-tight">
          DAT<span style={{ opacity: 0.75 }}>SHIN</span>
        </span>
        <span
          className="text-white text-xs font-bold tracking-[0.2em] uppercase opacity-80"
        >
          Admit One
        </span>
      </div>

      {/* MOVIE POSTER + TITLE */}
      <div className="relative h-44 bg-zinc-900 overflow-hidden">
        {movie.backdropUrl || movie.posterUrl ? (
          <Image
            src={movie.backdropUrl ?? movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover object-top"
            unoptimized
          />
        ) : null}
        {/* gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-white text-xl font-bold leading-tight drop-shadow">{movie.title}</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex divide-x divide-dashed divide-zinc-200" style={{ background: "#fff" }}>
        {/* LEFT — date/time/venue */}
        <div className="flex-1 px-5 py-4 space-y-2.5">
          <div>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Date</p>
            <p className="text-zinc-900 font-semibold text-sm">{formatDate(showtime.startTime)}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Time</p>
            <p className="text-zinc-900 font-black text-2xl">{formatTime(showtime.startTime)}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Theater</p>
            <p className="text-zinc-900 font-semibold text-sm">{theater.name}</p>
            <p className="text-zinc-500 text-xs">{theater.city}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Hall</p>
            <div className="flex items-center gap-2">
              <p className="text-zinc-900 font-semibold text-sm">{hall.name}</p>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                style={{ background: "#dc2626" }}
              >
                {hallLabel}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — QR code */}
        <div className="w-32 flex flex-col items-center justify-center px-4 py-4 gap-2">
          {qrDataUrl ? (
            <div className="bg-white p-1.5 rounded border border-zinc-200">
              <Image
                src={qrDataUrl}
                alt="Entry QR"
                width={96}
                height={96}
                unoptimized
              />
            </div>
          ) : (
            <div
              className="w-24 h-24 rounded bg-zinc-100 flex items-center justify-center"
            >
              <span className="text-zinc-400 text-xs text-center">Generating…</span>
            </div>
          )}
          <p className="text-zinc-900 font-mono text-[9px] font-bold text-center leading-tight">{bookingRef}</p>
          <p className="text-zinc-400 text-[9px] text-center">Scan to enter</p>
        </div>
      </div>

      {/* SEAT PILLS */}
      <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Seats</p>
          <p className="text-zinc-700 text-xs font-bold">{formatCurrency(booking.totalAmount)} total</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sortedSeats.map((bs) => (
            <span
              key={bs.seat.id}
              className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: SEAT_TYPE_COLOR[bs.seat.seatType] ?? "#3f3f46" }}
            >
              {bs.seat.rowLabel}{bs.seat.seatNumber}
              <span className="opacity-70 font-normal ml-1 text-[10px]">
                {bs.seat.seatType.charAt(0) + bs.seat.seatType.slice(1).toLowerCase()}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* BARCODE STRIP */}
      <div className="px-5 py-3 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between">
        {/* Decorative barcode CSS */}
        <div className="flex gap-px h-6 items-end">
          {[2,4,1,3,5,2,3,1,4,2,3,5,1,3,2,4,1,5,3,2,4,1,3].map((h, i) => (
            <div
              key={i}
              className="bg-zinc-700"
              style={{ width: 2, height: `${h * 4}px` }}
            />
          ))}
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs">Valid for one entry only</p>
          <p className="text-zinc-400 font-mono text-[9px]">{booking.id}</p>
        </div>
      </div>
    </div>
  );
}
