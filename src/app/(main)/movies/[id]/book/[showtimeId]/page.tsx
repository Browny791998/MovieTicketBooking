import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SeatSelectionClient } from "@/components/seats/SeatSelectionClient";

interface Props {
  params: { id: string; showtimeId: string };
}

async function getShowtime(id: string) {
  return prisma.showtime.findUnique({
    where: { id },
    include: {
      movie: true,
      hall: { include: { theater: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const showtime = await getShowtime(params.showtimeId);
  if (!showtime) return { title: "Select Seats | Dat Shin" };
  return {
    title: `${showtime.movie.title} — Select Your Seats | Dat Shin`,
    description: `Pick your seats for ${showtime.movie.title} at ${showtime.hall.theater.name}`,
  };
}

export default async function BookPage({ params }: Props) {
  const session = await auth();
  if (!session) {
    redirect(
      `/login?callbackUrl=/movies/${params.id}/book/${params.showtimeId}`
    );
  }

  const showtime = await getShowtime(params.showtimeId);

  if (!showtime || showtime.status !== "SCHEDULED") {
    redirect(`/movies/${params.id}`);
  }

  if (new Date(showtime.startTime) < new Date()) {
    redirect(`/movies/${params.id}`);
  }

  return <SeatSelectionClient showtime={showtime} />;
}
