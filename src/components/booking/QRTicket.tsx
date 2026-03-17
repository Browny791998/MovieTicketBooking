"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface QRTicketProps {
  bookingId: string;
  userId: string;
  showtimeId: string;
}

export function QRTicket({ bookingId, userId, showtimeId }: QRTicketProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await axios.post("/api/payment/verify", {
          bookingId,
          generateQR: true,
        });
        setQrUrl(res.data.qrCode);
      } catch {
        // fallback: generate client-side data URL
        const text = JSON.stringify({ bookingId, userId, showtimeId });
        setQrUrl(`data:text/plain,${encodeURIComponent(text)}`);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [bookingId, userId, showtimeId]);

  if (loading) return <Skeleton className="w-[200px] h-[200px] rounded-xl mx-auto" />;

  if (!qrUrl) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-xl shadow-lg">
        <Image
          src={qrUrl}
          alt="Booking QR Code"
          width={180}
          height={180}
          className="block"
          unoptimized
        />
      </div>
      <p className="text-xs text-zinc-500">Show this at the entrance</p>
    </div>
  );
}
