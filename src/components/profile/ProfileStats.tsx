"use client";

import { Ticket, DollarSign, Film } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface ProfileStatsData {
  totalBookings: number;
  totalSpent: number;
  upcomingCount: number;
  favoriteGenre: string | null;
}

export function ProfileStats({ stats }: { stats: ProfileStatsData }) {
  const items = [
    {
      icon: Ticket,
      label: "Total Bookings",
      value: stats.totalBookings.toString(),
      sub: `${stats.upcomingCount} upcoming`,
    },
    {
      icon: DollarSign,
      label: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      sub: "confirmed bookings",
    },
    {
      icon: Film,
      label: "Favorite Genre",
      value: stats.favoriteGenre ?? "—",
      sub: stats.favoriteGenre ? "most booked" : "book more movies",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value, sub }) => (
        <div
          key={label}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 border border-red-800/30">
            <Icon className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <p className="text-xl font-black text-white">{value}</p>
            <p className="text-xs text-zinc-500 leading-tight">{label}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
