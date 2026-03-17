import { PrismaClient, HallType, SeatType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { enrichAllMovies } from "../src/lib/movie-enrichment";

const prisma = new PrismaClient();

const today = new Date();
today.setHours(0, 0, 0, 0);

function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
}

const MOVIES = [
  {
    title: "Stellar Drift",
    genre: "Sci-Fi",
    language: "English",
    durationMins: 148,
    rating: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400",
    releaseDate: today,
    description: "An astronaut discovers a wormhole at the edge of the solar system, leading to a journey that defies space and time.",
  },
  {
    title: "Tokyo Requiem",
    genre: "Drama",
    language: "Japanese",
    durationMins: 122,
    rating: "R",
    posterUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
    releaseDate: daysAgo(7),
    description: "A musician's journey through grief, memory, and redemption in the neon-lit streets of Tokyo.",
  },
  {
    title: "Iron Horizon",
    genre: "Action",
    language: "English",
    durationMins: 135,
    rating: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400",
    releaseDate: daysAgo(3),
    description: "A rogue agent races against time to prevent a global catastrophe hidden behind closed borders.",
  },
  {
    title: "The Last Garden",
    genre: "Romance",
    language: "English",
    durationMins: 108,
    rating: "PG",
    posterUrl: "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=400",
    releaseDate: daysAgo(14),
    description: "Two strangers meet in a rooftop garden above a city that never sleeps and discover what truly matters.",
  },
  {
    title: "Phantom Code",
    genre: "Thriller",
    language: "English",
    durationMins: 118,
    rating: "R",
    posterUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
    releaseDate: daysAgo(5),
    description: "A hacker uncovers a government conspiracy buried deep in encrypted networks — and becomes the next target.",
  },
  {
    title: "Sakura Storm",
    genre: "Animation",
    language: "Japanese",
    durationMins: 96,
    rating: "G",
    posterUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400",
    releaseDate: daysAgo(1),
    description: "A young girl discovers she can control the seasons, but saving her village means letting go of everything she loves.",
  },
  {
    title: "Void Walkers",
    genre: "Horror",
    language: "English",
    durationMins: 104,
    rating: "R",
    posterUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=400",
    releaseDate: daysAgo(2),
    description: "A team of explorers ventures into an abandoned research station — only to find something was left behind.",
  },
  {
    title: "Grand Circuit",
    genre: "Sports",
    language: "English",
    durationMins: 130,
    rating: "PG",
    posterUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    releaseDate: today,
    description: "An underdog driver from the streets of Osaka fights his way to the world championship against impossible odds.",
  },
];

const THEATER_DEFS = [
  {
    name: "CineBook Central",
    city: "Tokyo",
    address: "Shinjuku 3-chome, Shinjuku, Tokyo",
    halls: [
      { name: "Hall A", hallType: HallType.STANDARD, rows: 8, seatsPerRow: 10 },
      { name: "Hall B", hallType: HallType.STANDARD, rows: 8, seatsPerRow: 10 },
      { name: "Hall C", hallType: HallType.IMAX, rows: 10, seatsPerRow: 12 },
      { name: "Hall D", hallType: HallType.FOURDX, rows: 6, seatsPerRow: 10 },
    ],
  },
  {
    name: "CineBook Shibuya",
    city: "Tokyo",
    address: "Shibuya 2-chome, Shibuya, Tokyo",
    halls: [
      { name: "Hall E", hallType: HallType.STANDARD, rows: 8, seatsPerRow: 10 },
      { name: "Hall F", hallType: HallType.STANDARD, rows: 8, seatsPerRow: 10 },
      { name: "Hall G", hallType: HallType.IMAX, rows: 10, seatsPerRow: 12 },
      { name: "Hall H", hallType: HallType.FOURDX, rows: 6, seatsPerRow: 10 },
    ],
  },
];

function getSeatConfig(
  hallType: HallType,
  rowLabel: string
): { seatType: SeatType; priceModifier: number } {
  const idx = rowLabel.charCodeAt(0) - "A".charCodeAt(0);

  if (hallType === HallType.STANDARD) {
    // A–F (0–5): STANDARD 1.0 | G–H (6–7): PREMIUM 1.4
    if (idx <= 5) return { seatType: SeatType.STANDARD, priceModifier: 1.0 };
    return { seatType: SeatType.PREMIUM, priceModifier: 1.4 };
  }

  if (hallType === HallType.IMAX) {
    // A–G (0–6): STANDARD 1.0 | H–I (7–8): PREMIUM 1.5 | J (9): RECLINER 2.0
    if (idx <= 6) return { seatType: SeatType.STANDARD, priceModifier: 1.0 };
    if (idx <= 8) return { seatType: SeatType.PREMIUM, priceModifier: 1.5 };
    return { seatType: SeatType.RECLINER, priceModifier: 2.0 };
  }

  // FOURDX — all PREMIUM 1.8
  return { seatType: SeatType.PREMIUM, priceModifier: 1.8 };
}

function basePriceForHall(hallType: HallType): number {
  if (hallType === HallType.IMAX) return 18;
  if (hallType === HallType.FOURDX) return 22;
  return 12;
}

function makeShowtime(date: Date, hours: number, minutes = 0): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear in dependency order
  await prisma.payment.deleteMany();
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin123!", 12);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@cinebook.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const customerHash = await bcrypt.hash("Customer123!", 12);
  await prisma.user.create({
    data: {
      name: "Yuki Tanaka",
      email: "yuki@example.com",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });
  console.log("✅ Users created  (admin@cinebook.com / Admin123!)");

  // ── Movies ─────────────────────────────────────────────────────────────────
  const createdMovies = await Promise.all(
    MOVIES.map((m) => prisma.movie.create({ data: m }))
  );
  console.log(`✅ ${createdMovies.length} movies created`);

  // ── Theaters → Halls → Seats ───────────────────────────────────────────────
  const allHalls: { id: string; hallType: HallType; basePrice: number }[] = [];

  for (const theaterDef of THEATER_DEFS) {
    const theater = await prisma.theater.create({
      data: {
        name: theaterDef.name,
        city: theaterDef.city,
        address: theaterDef.address,
      },
    });

    for (const hallDef of theaterDef.halls) {
      const totalSeats = hallDef.rows * hallDef.seatsPerRow;
      const hall = await prisma.hall.create({
        data: {
          theaterId: theater.id,
          name: hallDef.name,
          hallType: hallDef.hallType,
          totalSeats,
        },
      });

      const seatData = [];
      for (let r = 0; r < hallDef.rows; r++) {
        const rowLabel = String.fromCharCode("A".charCodeAt(0) + r);
        for (let s = 1; s <= hallDef.seatsPerRow; s++) {
          const { seatType, priceModifier } = getSeatConfig(hallDef.hallType, rowLabel);
          seatData.push({ hallId: hall.id, rowLabel, seatNumber: s, seatType, priceModifier });
        }
      }
      await prisma.seat.createMany({ data: seatData });

      allHalls.push({ id: hall.id, hallType: hallDef.hallType, basePrice: basePriceForHall(hallDef.hallType) });
    }
  }
  console.log(`✅ 2 theaters, 8 halls, seats created`);

  // ── Showtimes — 3 per movie per day across 7 days ──────────────────────────
  // Time slots: 10:00, 14:30, 19:00, 21:30
  const TIME_SLOTS = [
    { h: 10, m: 0 },
    { h: 14, m: 30 },
    { h: 19, m: 0 },
    { h: 21, m: 30 },
  ];

  let count = 0;

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    for (let mi = 0; mi < createdMovies.length; mi++) {
      const movie = createdMovies[mi];
      // Pick 3 time slots for this movie (rotating based on movie index)
      const slots = [
        TIME_SLOTS[mi % 4],
        TIME_SLOTS[(mi + 1) % 4],
        TIME_SLOTS[(mi + 2) % 4],
      ];
      for (let si = 0; si < 3; si++) {
        const hall = allHalls[(count) % allHalls.length];
        await prisma.showtime.create({
          data: {
            movieId: movie.id,
            hallId: hall.id,
            startTime: makeShowtime(date, slots[si].h, slots[si].m),
            basePrice: hall.basePrice,
            status: "SCHEDULED",
          },
        });
        count++;
      }
    }
  }

  console.log(`✅ ${count} showtimes created`);

  // Enrich movies with TMDB/OMDB if API key is set
  if (process.env.TMDB_API_KEY) {
    console.log("\n🎥 Enriching movies with TMDB/OMDB...");
    try {
      const { enriched, failed } = await enrichAllMovies();
      console.log(`✅ Enriched ${enriched} movies${failed.length ? `, failed: ${failed.join(", ")}` : ""}`);
    } catch (err) {
      console.warn("⚠️  Movie enrichment failed:", err);
    }
  } else {
    console.log("\n⚠️  TMDB_API_KEY not set — skipping movie enrichment");
  }

  console.log("\n🎬 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:    admin@cinebook.com / Admin123!");
  console.log("Customer: yuki@example.com  / Customer123!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
