"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date;
}

type SortDir = "asc" | "desc";

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  pageSize?: number;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Reset to page 1 whenever data or search changes
  useEffect(() => { setPage(1); }, [data]);

  const filtered = search
    ? data.filter((row) =>
        searchKeys.some((key) =>
          String(row[key]).toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const col = columns.find((c) => c.key === sortKey);
        const valA = col?.sortValue ? col.sortValue(a) : (a as Record<string, unknown>)[sortKey];
        const valB = col?.sortValue ? col.sortValue(b) : (b as Record<string, unknown>)[sortKey];
        if (valA == null) return 1;
        if (valB == null) return -1;
        const cmp =
          typeof valA === "number" && typeof valB === "number"
            ? valA - valB
            : String(valA).localeCompare(String(valB));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown className="h-3 w-3 text-zinc-600" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-red-400" />
      : <ChevronDown className="h-3 w-3 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      {searchable && (
        <div className="relative group max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
          <Input
            placeholder="Search everything..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-zinc-900/50 border-zinc-800/80 focus:border-red-600/50 focus:ring-red-600/20 h-11 transition-all"
          />
        </div>
      )}

      <div className="glass-card overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-widest text-[10px]",
                      col.sortable && "cursor-pointer select-none hover:text-zinc-200 transition-colors",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && <SortIcon colKey={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-zinc-500 italic"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id} className="premium-table-row group">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-6 py-4 text-zinc-300 transition-colors group-hover:text-white", col.className)}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-zinc-500 font-medium">
            Showing <span className="text-zinc-300">{(page - 1) * pageSize + 1}</span>–
            <span className="text-zinc-300">{Math.min(page * pageSize, sorted.length)}</span> of{" "}
            <span className="text-zinc-300">{sorted.length}</span> entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 h-8 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 h-8 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
