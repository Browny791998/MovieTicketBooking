"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { BookingWithDetails } from "@/types";
import { Search, X, Trash2 } from "lucide-react";

type SortField = "bookedAt" | "totalAmount";
type SortDir = "asc" | "desc";

const statusVariants = {
  CONFIRMED: "success" as const,
  PENDING: "warning" as const,
  CANCELLED: "destructive" as const,
};

type Booking = BookingWithDetails & { user: { name: string | null; email: string } };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState<SortField>("bookedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const load = () => {
    axios.get("/api/bookings")
      .then((r) => setBookings(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this cancelled booking? This cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/bookings/${id}`);
      load();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Delete failed";
      alert(msg ?? "Delete failed");
    }
  };

  const filtered = useMemo(() => {
    let result = [...bookings];

    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (fromDate) {
      result = result.filter((b) => new Date(b.bookedAt) >= new Date(fromDate));
    }
    if (toDate) {
      result = result.filter((b) => new Date(b.bookedAt) <= new Date(toDate + "T23:59:59"));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) =>
        b.showtime.movie.title.toLowerCase().includes(q) ||
        (b.user?.name ?? "").toLowerCase().includes(q) ||
        (b.user?.email ?? "").toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const av = sortField === "bookedAt" ? new Date(a.bookedAt).getTime() : a.totalAmount;
      const bv = sortField === "bookedAt" ? new Date(b.bookedAt).getTime() : b.totalAmount;
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return result;
  }, [bookings, statusFilter, fromDate, toDate, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter("ALL"); setFromDate(""); setToDate("");
  };
  const hasFilters = search || statusFilter !== "ALL" || fromDate || toDate;

  const totalRevenue = filtered.filter((b) => b.status === "CONFIRMED").reduce((s, b) => s + b.totalAmount, 0);

  const columns = [
    {
      key: "id",
      header: "Booking ID",
      render: (b: Booking) => (
        <span className="font-mono text-xs text-zinc-400">{b.id.slice(0, 8)}…</span>
      ),
    },
    {
      key: "user",
      header: "Customer",
      render: (b: Booking) => (
        <div>
          <p className="text-zinc-100">{b.user?.name ?? "—"}</p>
          <p className="text-xs text-zinc-500">{b.user?.email}</p>
        </div>
      ),
    },
    {
      key: "movie",
      header: "Movie",
      render: (b: Booking) => (
        <span className="font-medium text-zinc-100">{b.showtime.movie.title}</span>
      ),
    },
    {
      key: "showtime",
      header: "Showtime",
      render: (b: Booking) => (
        <div className="text-sm text-zinc-400">
          <p>{formatDate(b.showtime.startTime)}</p>
          <p>{formatTime(b.showtime.startTime)}</p>
        </div>
      ),
    },
    {
      key: "seats",
      header: "Seats",
      render: (b: Booking) => (
        <span className="font-mono text-xs">
          {b.bookingSeats.map((bs) => `${bs.seat.rowLabel}${bs.seat.seatNumber}`).join(", ")}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: "Amount",
      render: (b: Booking) => (
        <span className="font-semibold text-red-400">{formatCurrency(b.totalAmount)}</span>
      ),
    },
    {
      key: "bookedAt",
      header: "Booked",
      render: (b: Booking) => (
        <span className="text-xs text-zinc-500">{formatDate(b.bookedAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (b: Booking) => (
        <Badge variant={statusVariants[b.status]}>{b.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (b: Booking) =>
        b.status === "CANCELLED" ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-red-400"
            title="Delete booking"
            onClick={() => handleDelete(b.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {filtered.length} bookings · confirmed revenue: <span className="text-emerald-400 font-semibold">{formatCurrency(totalRevenue)}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl border border-white/5 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search movie, customer, booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-zinc-800 h-9 text-sm"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === s ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-zinc-500 hover:text-white h-9">
              <X className="h-3.5 w-3.5" />Clear
            </Button>
          )}
        </div>

        {/* Date range */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs text-zinc-500 font-medium">Date range:</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40 bg-zinc-900/50 border-zinc-800 h-9 text-sm"
          />
          <span className="text-zinc-600">→</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40 bg-zinc-900/50 border-zinc-800 h-9 text-sm"
          />

          {/* Sort controls */}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("bookedAt")}
              className={`h-9 text-xs gap-1 ${sortField === "bookedAt" ? "border-red-600 text-red-400" : ""}`}
            >
              Date {sortField === "bookedAt" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("totalAmount")}
              className={`h-9 text-xs gap-1 ${sortField === "totalAmount" ? "border-red-600 text-red-400" : ""}`}
            >
              Amount {sortField === "totalAmount" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        searchable={false}
      />
    </div>
  );
}
