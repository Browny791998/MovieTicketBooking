"use client";

import { useEffect, useState } from "react";
import type { QRPayload } from "@/lib/qr";

export function useQRCode(payload: QRPayload | null): {
  qrDataUrl: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payload) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // Dynamic import keeps qrcode out of the initial bundle
    import("qrcode").then((QRCode) => {
      return QRCode.default.toDataURL(JSON.stringify(payload), {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#ffffff" },
      });
    }).then((url) => {
      if (!cancelled) {
        setQrDataUrl(url);
        setIsLoading(false);
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err?.message ?? "Failed to generate QR code");
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [payload?.bookingId]); // re-run only if booking changes

  return { qrDataUrl, isLoading, error };
}
