"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingWithDetails } from "@/types";
import { BookingTicket } from "@/components/booking/BookingTicket";
import { useQRCode } from "@/hooks/useQRCode";
import { buildQRPayload } from "@/lib/qr";
import { emitToast } from "@/hooks/useToast";
import { Ticket, QrCode, Printer, Download, Send, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketModalProps {
  booking: BookingWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "ticket" | "qr";

export function TicketModal({ booking, open, onOpenChange }: TicketModalProps) {
  const [tab, setTab] = useState<Tab>("ticket");
  const [resending, setResending] = useState(false);

  const payload = open && booking.status === "CONFIRMED" ? buildQRPayload(booking) : null;
  const { qrDataUrl, isLoading: qrLoading } = useQRCode(payload);

  const bookingRef = "BOOK-" + booking.id.slice(0, 8).toUpperCase();

  const handleDownloadQR = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `ticket-${bookingRef}.png`;
    a.click();
  }, [qrDataUrl, bookingRef]);

  const handlePrint = () => window.print();

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await axios.post(`/api/bookings/${booking.id}/resend-email`);
      emitToast({ title: "Email sent", description: "Confirmation resent to your inbox.", variant: "success" });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed") : "Failed";
      emitToast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ticket", label: "Digital Ticket", icon: <Ticket className="h-3.5 w-3.5" /> },
    { id: "qr", label: "QR Code", icon: <QrCode className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(.printable-ticket-root) { display: none !important; }
          .printable-ticket-root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 p-0 overflow-hidden max-h-[95vh] flex flex-col">
          <DialogHeader className="no-print bg-gradient-to-r from-red-950/60 to-zinc-900 px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0">
            <DialogTitle className="text-white flex items-center gap-2">
              <Ticket className="h-5 w-5 text-red-400" />
              Your Ticket
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="no-print flex border-b border-zinc-800 shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                  tab === t.id
                    ? "text-white border-b-2 border-red-500"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content — scrollable */}
          <div className="overflow-y-auto flex-1">
            {tab === "ticket" && (
              <div className="p-4">
                <BookingTicket booking={booking} qrDataUrl={qrDataUrl} />
              </div>
            )}

            {tab === "qr" && (
              <div className="flex flex-col items-center gap-4 p-8">
                {qrLoading ? (
                  <Skeleton className="w-[240px] h-[240px] rounded-xl" />
                ) : qrDataUrl ? (
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="Ticket QR Code" width={220} height={220} />
                  </div>
                ) : (
                  <div className="w-[240px] h-[240px] bg-zinc-800 rounded-xl flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">QR unavailable</p>
                  </div>
                )}

                <div className="text-center space-y-1">
                  <p className="text-white font-mono font-bold text-base tracking-widest">{bookingRef}</p>
                  <p className="text-zinc-400 text-sm">Scan at the theater entrance</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownloadQR}
                  disabled={!qrDataUrl}
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </Button>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="no-print border-t border-zinc-800 px-4 py-3 flex gap-2 flex-wrap shrink-0">
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
            >
              <Download className="h-4 w-4" />
              QR
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-zinc-400"
              onClick={handleResendEmail}
              disabled={resending}
            >
              {resending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Resend Email
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-only portal */}
      {open && tab === "ticket" && (
        <div className="printable-ticket-root" style={{ display: "none" }}>
          <BookingTicket booking={booking} qrDataUrl={qrDataUrl} />
        </div>
      )}
    </>
  );
}
