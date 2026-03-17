import {
  User,
  Movie,
  Theater,
  Hall,
  Seat,
  Showtime,
  Booking,
  BookingSeat,
  Payment,
  CastMember,
  Role,
  HallType,
  SeatType,
  ShowtimeStatus,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";

export type {
  User,
  Movie,
  Theater,
  Hall,
  Seat,
  Showtime,
  Booking,
  BookingSeat,
  Payment,
  CastMember,
  Role,
  HallType,
  SeatType,
  ShowtimeStatus,
  BookingStatus,
  PaymentStatus,
};

// Seat status as returned from /api/showtimes/[id]/seats
export type SeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED";

export interface SeatWithStatus {
  id: string;
  rowLabel: string;
  seatNumber: number;
  seatType: SeatType;
  priceModifier: number;
  price: number;
  status: SeatStatus;
  lockedByMe: boolean;
}

export interface ShowtimeWithDetails extends Showtime {
  movie: Movie;
  hall: Hall & { theater: Theater };
}

export interface ShowtimeDetails extends Showtime {
  movie: Pick<Movie, "id" | "title" | "posterUrl" | "durationMins" | "language" | "rating">;
  hall: Hall & { theater: Theater };
}

export interface BookingWithDetails extends Booking {
  showtime: ShowtimeWithDetails;
  bookingSeats: (BookingSeat & { seat: Seat })[];
  payment?: Payment | null;
}

export interface MovieWithShowtimes extends Movie {
  showtimes: (Showtime & { hall: Hall & { theater: Theater } })[];
}

export interface EnrichedMovie extends Movie {
  castMembers: CastMember[];
}

export interface SelectedSeat {
  seatId: string;
  rowLabel: string;
  seatNumber: number;
  seatType: SeatType;
  price: number;
}

export interface BookingCreationResult {
  bookingId: string;
  totalAmount: number;
  seats: SelectedSeat[];
}

export interface BookingState {
  showtimeId: string | null;
  selectedSeats: SelectedSeat[];
  bookingId: string | null;
  clientSecret: string | null;
  totalAmount: number;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface DashboardStats {
  totalBookingsToday: number;
  revenueToday: number;
  totalMovies: number;
  totalUsers: number;
  showtimeOccupancy: {
    showtimeId: string;
    movieTitle: string;
    startTime: Date;
    totalSeats: number;
    bookedSeats: number;
    occupancyRate: number;
  }[];
}
