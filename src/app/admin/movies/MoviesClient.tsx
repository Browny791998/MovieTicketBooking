"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Movie } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import { MovieForm } from "@/components/admin/MovieForm";
import { DataTable } from "@/components/admin/DataTable";
import { Plus, Pencil, Trash2, Film, Sparkles, CheckCircle2, Loader2, X } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

type EnrichStatus = "idle" | "enriching" | "done" | "error";

const RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMovie, setEditMovie] = useState<Movie | null>(null);
  const [enrichAllStatus, setEnrichAllStatus] = useState<EnrichStatus>("idle");
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  // Filter state
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterEnriched, setFilterEnriched] = useState("all");

  const load = async () => {
    const res = await axios.get("/api/movies");
    setMovies(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    await axios.delete(`/api/movies/${id}`);
    load();
  };

  const handleEnrichOne = async (id: string) => {
    setEnrichingId(id);
    try {
      await axios.post("/api/admin/movies/enrich", { movieId: id });
      await load();
    } catch {
      alert("Enrichment failed. Check API keys.");
    } finally {
      setEnrichingId(null);
    }
  };

  const handleEnrichAll = async () => {
    if (!confirm("Enrich all unenriched movies? This calls TMDB + OMDB APIs.")) return;
    setEnrichAllStatus("enriching");
    try {
      const res = await axios.put("/api/admin/movies/enrich");
      const { enriched, failed } = res.data;
      setEnrichAllStatus("done");
      await load();
      alert(`Enriched ${enriched} movies.${failed.length ? ` Failed: ${failed.join(", ")}` : ""}`);
    } catch {
      setEnrichAllStatus("error");
      alert("Enrichment failed. Check API keys.");
    }
  };

  // Unique genres from loaded movies
  const genres = useMemo(
    () => Array.from(new Set(movies.map((m) => m.genre).filter(Boolean))).sort(),
    [movies]
  );

  // Apply filters before passing to DataTable
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (filterGenre !== "all" && m.genre !== filterGenre) return false;
      if (filterRating !== "all" && m.rating !== filterRating) return false;
      if (filterEnriched !== "all") {
        const enriched = !!(m as Movie & { enrichedAt?: string | null }).enrichedAt;
        if (filterEnriched === "yes" && !enriched) return false;
        if (filterEnriched === "no" && enriched) return false;
      }
      return true;
    });
  }, [movies, filterGenre, filterRating, filterEnriched]);

  const activeFilterCount = [filterGenre, filterRating, filterEnriched].filter((v) => v !== "all").length;

  const clearFilters = () => {
    setFilterGenre("all");
    setFilterRating("all");
    setFilterEnriched("all");
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (m: Movie) => (
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-red-400 shrink-0" />
          <span className="font-medium text-zinc-100">{m.title}</span>
        </div>
      ),
    },
    {
      key: "genre",
      header: "Genre",
      sortable: true,
    },
    {
      key: "durationMins",
      header: "Duration",
      sortable: true,
      sortValue: (m: Movie) => m.durationMins,
      render: (m: Movie) => formatDuration(m.durationMins),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (m: Movie) => <Badge variant="secondary">{m.rating}</Badge>,
    },
    {
      key: "releaseDate",
      header: "Release",
      sortable: true,
      sortValue: (m: Movie) => new Date(m.releaseDate).getTime(),
      render: (m: Movie) => formatDate(m.releaseDate),
    },
    {
      key: "enriched",
      header: "Enriched",
      sortable: true,
      sortValue: (m: Movie) =>
        (m as Movie & { enrichedAt?: string | null }).enrichedAt ? 1 : 0,
      render: (m: Movie) => {
        const enriched = !!(m as Movie & { enrichedAt?: string | null }).enrichedAt;
        return enriched ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <span className="text-xs text-zinc-500">—</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (m: Movie) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Enrich with TMDB/OMDB"
            onClick={() => handleEnrichOne(m.id)}
            disabled={enrichingId === m.id}
          >
            {enrichingId === m.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-yellow-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setEditMovie(m); setShowForm(true); }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300"
            onClick={() => handleDelete(m.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Movies</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {filteredMovies.length === movies.length
              ? `${movies.length} movies total`
              : `${filteredMovies.length} of ${movies.length} movies`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleEnrichAll}
            disabled={enrichAllStatus === "enriching"}
            className="gap-2 border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
          >
            {enrichAllStatus === "enriching" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Enrich All
          </Button>
          <Button
            onClick={() => { setEditMovie(null); setShowForm(true); }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Movie
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filterGenre} onValueChange={setFilterGenre}>
          <SelectTrigger className="h-9 text-xs w-36 bg-zinc-900/50 border-zinc-800">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="h-9 text-xs w-32 bg-zinc-900/50 border-zinc-800">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {RATINGS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterEnriched} onValueChange={setFilterEnriched}>
          <SelectTrigger className="h-9 text-xs w-36 bg-zinc-900/50 border-zinc-800">
            <SelectValue placeholder="Enriched" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Enriched</SelectItem>
            <SelectItem value="no">Not Enriched</SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1.5 text-xs text-zinc-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
            <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] h-4 w-4">
              {activeFilterCount}
            </span>
          </Button>
        )}
      </div>

      <DataTable
        data={filteredMovies}
        columns={columns}
        searchKeys={["title", "genre"]}
      />

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditMovie(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editMovie ? "Edit Movie" : "Add New Movie"}</DialogTitle>
          </DialogHeader>
          <MovieForm
            movie={editMovie ?? undefined}
            onSuccess={() => { setShowForm(false); setEditMovie(null); load(); }}
            onCancel={() => { setShowForm(false); setEditMovie(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
