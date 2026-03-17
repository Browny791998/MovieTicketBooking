import nodemailer from "nodemailer";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { buildQRPayload, generateQRBuffer } from "@/lib/qr";
import {
  bookingConfirmationTemplate,
  cancellationTemplate,
  reminderTemplate,
  type EmailContext,
} from "@/lib/email-templates";
import type { BookingWithDetails } from "@/types";

// ─── Transporter ─────────────────────────────────────────────────────────────

async function getTransporter() {
  if (process.env.EMAIL_USER) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  // Dev fallback: Ethereal auto-account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

// ─── DB fetch ────────────────────────────────────────────────────────────────

export async function getBookingWithDetails(bookingId: string): Promise<BookingWithDetails> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      showtime: {
        include: {
          movie: true,
          hall: { include: { theater: true } },
        },
      },
      bookingSeats: {
        include: { seat: true },
        orderBy: [{ seat: { rowLabel: "asc" } }, { seat: { seatNumber: "asc" } }],
      },
      payment: true,
    },
  });

  if (!booking) throw new Error(`Booking ${bookingId} not found`);
  return booking as BookingWithDetails;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBookingSeats(
  bookingSeats: { seat: { rowLabel: string; seatNumber: number } }[]
): string {
  return bookingSeats
    .sort((a, b) =>
      a.seat.rowLabel.localeCompare(b.seat.rowLabel) ||
      a.seat.seatNumber - b.seat.seatNumber
    )
    .map((bs) => `${bs.seat.rowLabel}${bs.seat.seatNumber}`)
    .join(", ");
}

function buildEmailContext(booking: BookingWithDetails): EmailContext {
  const { showtime, bookingSeats } = booking;
  const movie = showtime.movie;
  const hall = showtime.hall;
  const theater = hall.theater;
  const user = (booking as typeof booking & { user: { name?: string | null; email: string; createdAt?: Date } }).user;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const payment = booking.payment;

  const seats = bookingSeats.map((bs) => ({
    label: `Row ${bs.seat.rowLabel} Seat ${bs.seat.seatNumber}`,
    type: bs.seat.seatType.charAt(0) + bs.seat.seatType.slice(1).toLowerCase(),
    price: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(bs.price),
  }));

  return {
    recipientName: user.name ?? user.email.split("@")[0],
    recipientEmail: user.email,
    bookingRef: "BOOK-" + booking.id.slice(0, 8).toUpperCase(),
    movieTitle: movie.title,
    moviePosterUrl: movie.posterUrl,
    theaterName: theater.name,
    theaterCity: theater.city,
    hallName: hall.name,
    hallType: hall.hallType,
    showDate: format(new Date(showtime.startTime), "EEEE, MMMM d, yyyy"),
    showTime: format(new Date(showtime.startTime), "HH:mm"),
    seatList: formatBookingSeats(bookingSeats),
    seatCount: bookingSeats.length,
    totalAmount: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(booking.totalAmount),
    paymentDate: payment?.paidAt ? format(new Date(payment.paidAt), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy"),
    appUrl,
    profileUrl: `${appUrl}/profile`,
    supportEmail: "hello@datshin.com.mm",
    seats,
  };
}

// ─── Public email functions ───────────────────────────────────────────────────

export async function sendBookingConfirmation(bookingId: string): Promise<void> {
  const booking = await getBookingWithDetails(bookingId);
  const user = (booking as typeof booking & { user: { email: string } }).user;
  if (!user?.email) return;

  const ctx = buildEmailContext(booking);
  const qrBuffer = await generateQRBuffer(buildQRPayload(booking));
  const qrCid = "qrcode@datshin";

  const html = bookingConfirmationTemplate(ctx, qrCid);
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"Dat Shin Tickets" <${process.env.EMAIL_USER ?? "noreply@datshin.com.mm"}>`,
    to: user.email,
    subject: `Booking Confirmed — ${ctx.movieTitle} on ${ctx.showDate}`,
    html,
    attachments: [
      {
        filename: `ticket-${ctx.bookingRef}.png`,
        content: qrBuffer,
        cid: qrCid,
        contentType: "image/png",
      },
    ],
  });

  if (!process.env.EMAIL_USER) {
    console.log("[mail] Preview URL:", nodemailer.getTestMessageUrl(info));
  }
}

export async function sendBookingCancellation(bookingId: string): Promise<void> {
  const booking = await getBookingWithDetails(bookingId);
  const user = (booking as typeof booking & { user: { email: string } }).user;
  if (!user?.email) return;

  const ctx = buildEmailContext(booking);
  const html = cancellationTemplate(ctx);
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"Dat Shin Tickets" <${process.env.EMAIL_USER ?? "noreply@datshin.com.mm"}>`,
    to: user.email,
    subject: `Booking Cancelled — ${ctx.movieTitle}`,
    html,
  });

  if (!process.env.EMAIL_USER) {
    console.log("[mail] Preview URL:", nodemailer.getTestMessageUrl(info));
  }
}

export async function sendBookingReminder(bookingId: string): Promise<void> {
  const booking = await getBookingWithDetails(bookingId);
  const user = (booking as typeof booking & { user: { email: string } }).user;
  if (!user?.email) return;

  const ctx = buildEmailContext(booking);
  const qrBuffer = await generateQRBuffer(buildQRPayload(booking));
  const qrCid = "qrcode@datshin";

  const html = reminderTemplate(ctx, qrCid);
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"Dat Shin Tickets" <${process.env.EMAIL_USER ?? "noreply@datshin.com.mm"}>`,
    to: user.email,
    subject: `Tomorrow: ${ctx.movieTitle} at ${ctx.showTime}`,
    html,
    attachments: [
      {
        filename: `ticket-${ctx.bookingRef}.png`,
        content: qrBuffer,
        cid: qrCid,
        contentType: "image/png",
      },
    ],
  });

  if (!process.env.EMAIL_USER) {
    console.log("[mail] Preview URL:", nodemailer.getTestMessageUrl(info));
  }
}
