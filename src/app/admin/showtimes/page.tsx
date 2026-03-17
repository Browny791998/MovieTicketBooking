"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import { ShowtimeForm } from "@/components/admin/ShowtimeForm";
import { DataTable } from "@/components/admin/DataTable";
import { Plus, CalendarDays, Search, X, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { ShowtimeWithDetails } from "@/types";

const statusVariants = {
  SCHEDULED: "success" as const,
  CANCELLED: "destructive" as const,
  COMPLETED: "secondary" as const,
};

type SortField = "startTime" | "basePrice";
type SortDir = "asc" | "desc";

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<ShowtimeWithDetails[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [theaterFilter, setTheaterFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState<SortField>("startTime");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const load = async () => {
    const res = await axios.get("/api/showtimes");
    setShowtimes(res.data);
  };

  useEffect(() => { load(); }, []);

  const theaters = useMemo(() => {
    const names = Array.from(new Set(showtimes.map((s) => s.hall.theater.name)));
    return names;
  }, [showtimes]);

  const filtered = useMemo(() => {
    let result = [...showtimes];

    if (statusFilter !== "ALL") result = result.filter((s) => s.status === statusFilter);
    if (theaterFilter !== "ALL") result = result.filter((s) => s.hall.theater.name === theaterFilter);
    if (fromDate) result = result.filter((s) => new Date(s.startTime) >= new Date(fromDate));
    if (toDate) result = result.filter((s) => new Date(s.startTime) <= new Date(toDate + "T23:59:59"));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.movie.title.toLowerCase().includes(q) ||
        s.hall.theater.name.toLowerCase().includes(q) ||
        s.hall.name.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const av = sortField === "startTime" ? new Date(a.startTime).getTime() : a.basePrice;
      const bv = sortField === "startTime" ? new Date(b.startTime).getTime() : b.basePrice;
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return result;
  }, [showtimes, statusFilter, theaterFilter, fromDate, toDate, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter("ALL"); setTheaterFilter("ALL"); setFromDate(""); setToDate("");
  };
  const hasFilters = search || statusFilter !== "ALL" || theaterFilter !== "ALL" || fromDate || toDate;

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this showtime?")) return;
    await axios.patch(`/api/showtimes/${id}`, { status: "CANCELLED" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this showtime? This cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/showtimes/${id}`);
      load();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Delete failed";
      alert(msg ?? "Delete failed");
    }
  };

  const columns = [
    {
      key: "movie",
      header: "Movie",
      render: (s: ShowtimeWithDetails) => (
        <span className="font-medium text-zinc-100">{s.movie.title}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (s: ShowtimeWithDetails) => formatDate(s.startTime),
    },
    {
      key: "time",
      header: "Time",
      render: (s: ShowtimeWithDetails) => formatTime(s.startTime),
    },
    {
      key: "theater",
      header: "Theater",
      render: (s: ShowtimeWithDetails) =>
        `${s.hall.theater.name} — ${s.hall.name}`,
    },
    {
      key: "basePrice",
      header: "Price",
      render: (s: ShowtimeWithDetails) => formatCurrency(s.basePrice),
    },
    {
      key: "status",
      header: "Status",
      render: (s: ShowtimeWithDetails) => (
        <Badge variant={statusVariants[s.status]}>{s.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (s: ShowtimeWithDetails) => (
        <div className="flex items-center gap-1">
          {s.status === "SCHEDULED" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              onClick={() => handleCancel(s.id)}
            >
              Cancel
            </Button>
          )}
          {(s.status === "CANCELLED" || s.status === "COMPLETED") && (
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 hover:text-red-400"
              title="Delete showtime"
              onClick={() => handleDelete(s.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Showtimes</h1>
          <p className="text-zinc-400 text-sm mt-1">{filtered.length} of {showtimes.length} showtimes</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Showtime
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl border border-white/5 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search movie or theater..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-zinc-800 h-9 text-sm"
            />
          </div>

          {/* Status */}
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((s) => (
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

        <div className="flex flex-wrap gap-3 items-center">
          {/* Theater filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setTheaterFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${theaterFilter === "ALL" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              All Theaters
            </button>
            {theaters.map((t) => (
              <button
                key={t}
                onClick={() => setTheaterFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${theaterFilter === t ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                {t.split(" ").slice(-1)[0]}
              </button>
            ))}
          </div>

          {/* Date range */}
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="w-40 bg-zinc-900/50 border-zinc-800 h-9 text-sm" />
          <span className="text-zinc-600">→</span>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="w-40 bg-zinc-900/50 border-zinc-800 h-9 text-sm" />

          {/* Sort */}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleSort("startTime")}
              className={`h-9 text-xs ${sortField === "startTime" ? "border-red-600 text-red-400" : ""}`}>
              Date {sortField === "startTime" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleSort("basePrice")}
              className={`h-9 text-xs ${sortField === "basePrice" ? "border-red-600 text-red-400" : ""}`}>
              Price {sortField === "basePrice" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </Button>
          </div>
        </div>
      </div>

      <DataTable data={filtered} columns={columns} searchable={false} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-red-400" />
              Schedule Showtime
            </DialogTitle>
          </DialogHeader>
          <ShowtimeForm
            onSuccess={() => { setShowForm(false); load(); }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
