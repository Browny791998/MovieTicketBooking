"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingCard } from "@/components/booking/BookingCard";
import { ProfileStats, type ProfileStatsData } from "@/components/profile/ProfileStats";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { BookingWithDetails } from "@/types";
import {
  Ticket, CalendarClock, History, XCircle, Pencil, Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "upcoming" | "past" | "cancelled";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [stats, setStats] = useState<ProfileStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      setDisplayName(session.user.name ?? session.user.email?.split("@")[0] ?? "");
      Promise.all([
        axios.get("/api/bookings?me=1"),
        axios.get("/api/profile"),
      ])
        .then(([bookingsRes, profileRes]) => {
          setBookings(bookingsRes.data);
          setStats(profileRes.data.stats);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router, session?.user.name, session?.user.email]);

  const handleNameUpdated = useCallback(async (newName: string) => {
    setDisplayName(newName);
    await updateSession({ name: newName });
  }, [updateSession]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (!session) return null;

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => (b.status === "CONFIRMED" || b.status === "PENDING") && new Date(b.showtime.startTime) >= now
  );
  const past = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.showtime.startTime) < now
  );
  const cancelled = bookings.filter((b) => b.status === "CANCELLED");

  const tabBookings: Record<Tab, BookingWithDetails[]> = { upcoming, past, cancelled };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "upcoming", label: "Upcoming", icon: <CalendarClock className="h-4 w-4" />, count: upcoming.length },
    { id: "past", label: "Past", icon: <History className="h-4 w-4" />, count: past.length },
    { id: "cancelled", label: "Cancelled", icon: <XCircle className="h-4 w-4" />, count: cancelled.length },
  ];

  const handleCancelled = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" as const } : b))
    );
    if (stats) setStats({ ...stats, totalBookings: Math.max(0, stats.totalBookings - 1) });
  };

  const initial = displayName?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase() ?? "U";
  const displayed = tabBookings[activeTab];

  const EMPTY_MESSAGES: Record<Tab, { icon: React.ReactNode; title: string; sub: string }> = {
    upcoming: {
      icon: <Film className="h-10 w-10 text-zinc-700 mx-auto mb-3" />,
      title: "No upcoming bookings",
      sub: "Your next movie adventure is just a click away.",
    },
    past: {
      icon: <History className="h-10 w-10 text-zinc-700 mx-auto mb-3" />,
      title: "No past bookings yet",
      sub: "Your booking history will appear here.",
    },
    cancelled: {
      icon: <XCircle className="h-10 w-10 text-zinc-700 mx-auto mb-3" />,
      title: "No cancelled bookings",
      sub: "",
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-5">
      {/* Profile header */}
      <div className="flex items-center gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xl shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-lg truncate">{displayName || "User"}</p>
          <p className="text-sm text-zinc-400 truncate">{session.user.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary">{session.user.role}</Badge>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Ticket className="h-3.5 w-3.5" />
            {bookings.length}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && <ProfileStats stats={stats} />}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-red-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-bold",
                  activeTab === tab.id ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking list / empty state */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
          {EMPTY_MESSAGES[activeTab].icon}
          <p className="text-zinc-300 font-semibold text-sm">{EMPTY_MESSAGES[activeTab].title}</p>
          {EMPTY_MESSAGES[activeTab].sub && (
            <p className="text-zinc-600 text-xs mt-1">{EMPTY_MESSAGES[activeTab].sub}</p>
          )}
          {activeTab === "upcoming" && (
            <Button
              variant="default"
              size="sm"
              className="mt-4 gap-2"
              onClick={() => router.push("/movies")}
            >
              <Film className="h-4 w-4" />
              Browse Movies
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancelled={handleCancelled}
            />
          ))}
        </div>
      )}

      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        currentName={displayName}
        email={session.user.email ?? ""}
        onUpdated={handleNameUpdated}
      />
    </div>
  );
}
