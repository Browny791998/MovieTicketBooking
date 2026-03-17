import QRCode from "qrcode";
import type { BookingWithDetails } from "@/types";

export interface QRPayload {
  bookingId: string;
  userId: string;
  showtimeId: string;
  ref: string;
  v: number;
}

export function buildQRPayload(booking: BookingWithDetails): QRPayload {
  return {
    bookingId: booking.id,
    userId: booking.userId,
    showtimeId: booking.showtimeId,
    ref: "BOOK-" + booking.id.slice(0, 8).toUpperCase(),
    v: 1,
  };
}

export async function generateQRDataUrl(payload: QRPayload): Promise<string> {
  return QRCode.toDataURL(JSON.stringify(payload), {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export async function generateQRBuffer(payload: QRPayload): Promise<Buffer> {
  return QRCode.toBuffer(JSON.stringify(payload), {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "H",
    type: "png",
  });
}

export async function generateQRSVG(payload: QRPayload): Promise<string> {
  return QRCode.toString(JSON.stringify(payload), { type: "svg" });
}

// Legacy shims for backward compat
interface QRData { bookingId: string; userId: string; showtimeId: string; }
function toPayload(d: QRData): QRPayload {
  return { ...d, ref: "BOOK-" + d.bookingId.slice(0, 8).toUpperCase(), v: 1 };
}
export async function generateQRCode(data: QRData): Promise<string> {
  return generateQRDataUrl(toPayload(data));
}
export async function generateQRCodeBuffer(data: QRData): Promise<Buffer> {
  return generateQRBuffer(toPayload(data));
}
