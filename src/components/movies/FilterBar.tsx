"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

const GENRES = ["Sci-Fi", "Drama", "Action", "Romance", "Thriller", "Animation", "Horror", "Sports", "Fantasy"];
const LANGUAGES = ["English", "Burmese", "Korean", "Thai", "Hindi"];
const RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A–Z" },
  { value: "duration", label: "Duration" },
];

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(search, 300);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Push debounced search
  useEffect(() => {
    updateParam("search", debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const activeCount = ["genre", "language", "rating", "search", "sort"].filter(
    (k) => searchParams.has(k)
  ).length;

  const clearAll = () => {
    setSearch("");
    router.push(pathname);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: search + clear */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-zinc-400 hover:text-white shrink-0">
            <X className="h-4 w-4" />
            Clear
            <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs h-4 w-4">
              {activeCount}
            </span>
          </Button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-zinc-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filter:</span>
        </div>

        <Select
          defaultValue={searchParams.get("genre") ?? "all"}
          onValueChange={(v) => updateParam("genre", v)}
        >
          <SelectTrigger className="h-8 text-xs w-32 shrink-0 whitespace-nowrap">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("language") ?? "all"}
          onValueChange={(v) => updateParam("language", v)}
        >
          <SelectTrigger className="h-8 text-xs w-32 shrink-0 whitespace-nowrap">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("rating") ?? "all"}
          onValueChange={(v) => updateParam("rating", v)}
        >
          <SelectTrigger className="h-8 text-xs w-28 shrink-0 whitespace-nowrap">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {RATINGS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-zinc-700 shrink-0" />

        <Select
          defaultValue={searchParams.get("sort") ?? "newest"}
          onValueChange={(v) => updateParam("sort", v)}
        >
          <SelectTrigger className="h-8 text-xs w-28 shrink-0 whitespace-nowrap">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
