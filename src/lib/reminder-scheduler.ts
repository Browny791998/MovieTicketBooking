import { prisma } from "@/lib/prisma";
import { sendBookingReminder } from "@/lib/mail";

export async function scheduleReminders(): Promise<number> {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 3600 * 1000); // 23h from now
  const windowEnd = new Date(now.getTime() + 25 * 3600 * 1000);   // 25h from now

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderSent: false,
      showtime: {
        startTime: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
    },
    select: { id: true },
  });

  let sent = 0;
  for (const booking of bookings) {
    try {
      await sendBookingReminder(booking.id);
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder for booking ${booking.id}:`, err);
    }
  }

  return sent;
}
