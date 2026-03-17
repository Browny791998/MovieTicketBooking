"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Armchair,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HallType = "STANDARD" | "IMAX" | "FOURDX";
type SeatType = "STANDARD" | "PREMIUM" | "RECLINER";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SeatDef {
  seatType: SeatType;
  priceModifier: number;
}
interface RowDef {
  label: string;
  seats: SeatDef[];
}

interface HallWithCount {
  id: string;
  name: string;
  hallType: HallType;
  totalSeats: number;
  _count: { seats: number };
}

interface TheaterWithHalls {
  id: string;
  name: string;
  city: string;
  address: string;
  halls: HallWithCount[];
}

// ─── Price modifiers by seat type ─────────────────────────────────────────────
const DEFAULT_MODIFIERS: Record<SeatType, number> = {
  STANDARD: 1.0,
  PREMIUM: 1.5,
  RECLINER: 1.8,
};

const HALL_TYPE_LABELS: Record<HallType, string> = {
  STANDARD: "Standard",
  IMAX: "IMAX",
  FOURDX: "4DX",
};

const SEAT_TYPE_COLORS: Record<SeatType, string> = {
  STANDARD: "bg-zinc-600 text-zinc-200",
  PREMIUM: "bg-amber-700 text-amber-100",
  RECLINER: "bg-purple-800 text-purple-100",
};

// ─── SeatLayoutBuilder ────────────────────────────────────────────────────────
function SeatLayoutBuilder({
  rows,
  onChange,
}: {
  rows: RowDef[];
  onChange: (rows: RowDef[]) => void;
}) {
  const addRow = () => {
    const nextLabel = String.fromCharCode(65 + rows.length); // A, B, C...
    onChange([...rows, { label: nextLabel, seats: Array(8).fill(null).map(() => ({ seatType: "STANDARD" as SeatType, priceModifier: 1.0 })) }]);
  };

  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  const updateLabel = (idx: number, label: string) => {
    const next = [...rows];
    next[idx] = { ...next[idx], label: label.toUpperCase() };
    onChange(next);
  };

  const setSeatCount = (rowIdx: number, count: number) => {
    const next = [...rows];
    const row = next[rowIdx];
    const cur = row.seats.length;
    if (count > cur) {
      next[rowIdx] = {
        ...row,
        seats: [...row.seats, ...Array(count - cur).fill(null).map(() => ({
          seatType: "STANDARD" as SeatType,
          priceModifier: 1.0,
        }))],
      };
    } else {
      next[rowIdx] = { ...row, seats: row.seats.slice(0, count) };
    }
    onChange(next);
  };

  const setSeatType = (rowIdx: number, seatIdx: number, seatType: SeatType) => {
    const next = [...rows];
    next[rowIdx].seats[seatIdx] = {
      seatType,
      priceModifier: DEFAULT_MODIFIERS[seatType],
    };
    onChange(next);
  };

  const setRowSeatType = (rowIdx: number, seatType: SeatType) => {
    const next = [...rows];
    next[rowIdx] = {
      ...next[rowIdx],
      seats: next[rowIdx].seats.map(() => ({
        seatType,
        priceModifier: DEFAULT_MODIFIERS[seatType],
      })),
    };
    onChange(next);
  };

  const setPriceModifier = (rowIdx: number, seatIdx: number, val: number) => {
    const next = [...rows];
    next[rowIdx].seats[seatIdx] = { ...next[rowIdx].seats[seatIdx], priceModifier: val };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-zinc-300">Seat Layout</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {(["STANDARD", "PREMIUM", "RECLINER"] as SeatType[]).map((t) => (
              <span key={t} className={cn("px-2 py-0.5 rounded font-bold", SEAT_TYPE_COLORS[t])}>{t}</span>
            ))}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addRow} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Add Row
          </Button>
        </div>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-zinc-500 text-center py-4 border border-dashed border-zinc-800 rounded-xl">
          No rows yet. Click &quot;Add Row&quot; to start.
        </p>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="border border-zinc-800 rounded-xl p-3 space-y-2 bg-zinc-900/50">
            <div className="flex items-center gap-2">
              {/* Row label */}
              <Input
                value={row.label}
                onChange={(e) => updateLabel(rowIdx, e.target.value)}
                className="w-12 h-7 text-center font-bold text-sm bg-zinc-800 border-zinc-700"
                maxLength={2}
              />
              {/* Seat count */}
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <span>Seats:</span>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={row.seats.length}
                  onChange={(e) => setSeatCount(rowIdx, Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  className="w-14 h-7 text-center text-sm bg-zinc-800 border-zinc-700"
                />
              </div>
              {/* Bulk seat type */}
              <Select onValueChange={(v) => setRowSeatType(rowIdx, v as SeatType)}>
                <SelectTrigger className="h-7 text-xs w-28 bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="All type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">All Standard</SelectItem>
                  <SelectItem value="PREMIUM">All Premium</SelectItem>
                  <SelectItem value="RECLINER">All Recliner</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(rowIdx)}
                className="ml-auto h-7 w-7 p-0 text-zinc-500 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Seat grid */}
            <div className="flex flex-wrap gap-1">
              {row.seats.map((seat, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  title={`${row.label}${sIdx + 1} — ${seat.seatType} (×${seat.priceModifier})`}
                  onClick={() => {
                    const types: SeatType[] = ["STANDARD", "PREMIUM", "RECLINER"];
                    const next = types[(types.indexOf(seat.seatType) + 1) % types.length];
                    setSeatType(rowIdx, sIdx, next);
                  }}
                  className={cn(
                    "w-7 h-7 rounded text-[10px] font-bold transition-all hover:opacity-80",
                    SEAT_TYPE_COLORS[seat.seatType]
                  )}
                >
                  {sIdx + 1}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600">Click a seat to cycle type: Standard → Premium → Recliner</p>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <p className="text-xs text-zinc-500">
          Total: <span className="text-zinc-300 font-bold">{rows.reduce((s, r) => s + r.seats.length, 0)}</span> seats across <span className="text-zinc-300 font-bold">{rows.length}</span> rows
        </p>
      )}
    </div>
  );
}

// ─── TheaterForm ──────────────────────────────────────────────────────────────
function TheaterForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { name: string; city: string; address: string };
  onSave: (data: { name: string; city: string; address: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !address.trim()) { setError("All fields required"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), city: city.trim(), address: address.trim() });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error ?? "Failed");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Theater Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CineMax Downtown" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Yangon" />
        </div>
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 123 Main St" />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Theater"}</Button>
      </div>
    </form>
  );
}

// ─── HallForm ─────────────────────────────────────────────────────────────────
function HallForm({
  theaterId,
  onSave,
  onCancel,
}: {
  theaterId: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [hallType, setHallType] = useState<HallType>("STANDARD");
  const [rows, setRows] = useState<RowDef[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Hall name is required"); return; }
    if (rows.length === 0 || rows.every((r) => r.seats.length === 0)) {
      setError("Add at least one row with seats");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await axios.post("/api/admin/halls", { theaterId, name, hallType, rows });
      onSave();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error ?? "Failed to create hall");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Hall Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hall 1, IMAX Hall" />
        </div>
        <div className="space-y-1.5">
          <Label>Hall Type</Label>
          <Select value={hallType} onValueChange={(v) => setHallType(v as HallType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STANDARD">Standard</SelectItem>
              <SelectItem value="IMAX">IMAX</SelectItem>
              <SelectItem value="FOURDX">4DX</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SeatLayoutBuilder rows={rows} onChange={setRows} />

      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Creating..." : `Create Hall (${rows.reduce((s, r) => s + r.seats.length, 0)} seats)`}
        </Button>
      </div>
    </form>
  );
}

// ─── SeatEditModal ────────────────────────────────────────────────────────────
function SeatEditModal({
  hallId,
  hallName,
  onClose,
  onSaved,
}: {
  hallId: string;
  hallName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<RowDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`/api/admin/halls/${hallId}`).then((r) => {
      // Build rows from existing seats
      const seats: { rowLabel: string; seatNumber: number; seatType: SeatType; priceModifier: number }[] = r.data.seats;
      const rowMap = new Map<string, SeatDef[]>();
      for (const s of seats) {
        if (!rowMap.has(s.rowLabel)) rowMap.set(s.rowLabel, []);
        rowMap.get(s.rowLabel)!.push({ seatType: s.seatType, priceModifier: s.priceModifier });
      }
      const builtRows: RowDef[] = Array.from(rowMap.entries()).map(([label, seatList]) => ({
        label,
        seats: seatList,
      }));
      setRows(builtRows);
    }).finally(() => setLoading(false));
  }, [hallId]);

  const save = async () => {
    if (rows.length === 0 || rows.every((r) => r.seats.length === 0)) {
      setError("At least one row with seats required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await axios.put(`/api/admin/halls/${hallId}/seats`, { rows });
      onSaved();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error ?? "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-zinc-400 text-center py-8">Loading seats...</p>
      ) : (
        <>
          <SeatLayoutBuilder rows={rows} onChange={setRows} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : `Save Layout (${rows.reduce((s, r) => s + r.seats.length, 0)} seats)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminTheatersPage() {
  const [theaters, setTheaters] = useState<TheaterWithHalls[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Theater dialogs
  const [theaterDialog, setTheaterDialog] = useState<"create" | { id: string; name: string; city: string; address: string } | null>(null);

  // Hall dialogs
  const [hallDialog, setHallDialog] = useState<string | null>(null); // theaterId
  const [seatDialog, setSeatDialog] = useState<{ hallId: string; hallName: string } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "theater" | "hall"; id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get("/api/admin/theaters");
      setTheaters(r.data);
    } catch {
      // unauthorized or server error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSaveTheater = async (data: { name: string; city: string; address: string }) => {
    if (theaterDialog === "create") {
      await axios.post("/api/admin/theaters", data);
    } else if (theaterDialog && typeof theaterDialog === "object") {
      await axios.patch(`/api/admin/theaters/${theaterDialog.id}`, data);
    }
    setTheaterDialog(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteError("");
    try {
      if (deleteConfirm.type === "theater") {
        await axios.delete(`/api/admin/theaters/${deleteConfirm.id}`);
      } else {
        await axios.delete(`/api/admin/halls/${deleteConfirm.id}`);
      }
      setDeleteConfirm(null);
      load();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setDeleteError(err.response?.data?.error ?? "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Theaters & Halls</h1>
          <p className="text-zinc-400 text-sm mt-1">{theaters.length} theater{theaters.length !== 1 ? "s" : ""} · {theaters.reduce((s, t) => s + t.halls.length, 0)} halls</p>
        </div>
        <Button onClick={() => setTheaterDialog("create")} className="gap-2">
          <Plus className="h-4 w-4" /> Add Theater
        </Button>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : theaters.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/5 p-12 text-center">
          <Building2 className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No theaters yet</p>
          <p className="text-zinc-600 text-sm mt-1">Add a theater to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {theaters.map((theater) => (
            <div key={theater.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              {/* Theater header */}
              <div
                className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleExpand(theater.id)}
              >
                <div className={cn("transition-transform", expanded.has(theater.id) ? "rotate-90" : "")}>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </div>
                <Building2 className="h-5 w-5 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{theater.name}</p>
                  <p className="text-xs text-zinc-500">{theater.city} — {theater.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">{theater.halls.length} hall{theater.halls.length !== 1 ? "s" : ""}</Badge>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setTheaterDialog({ id: theater.id, name: theater.name, city: theater.city, address: theater.address }); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: "theater", id: theater.id, name: theater.name }); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Halls */}
              {expanded.has(theater.id) && (
                <div className="border-t border-white/5 px-6 py-4 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Halls</p>
                    <Button
                      size="sm" variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => setHallDialog(theater.id)}
                    >
                      <Plus className="h-3 w-3" /> Add Hall
                    </Button>
                  </div>

                  {theater.halls.length === 0 ? (
                    <p className="text-sm text-zinc-600 py-3 text-center">No halls yet</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {theater.halls.map((hall) => (
                        <div
                          key={hall.id}
                          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                        >
                          <Armchair className="h-4 w-4 text-zinc-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-zinc-100">{hall.name}</p>
                            <p className="text-xs text-zinc-500">{HALL_TYPE_LABELS[hall.hallType]} · {hall.totalSeats} seats</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost" size="sm"
                              className="h-6 w-6 p-0 text-zinc-500 hover:text-blue-400"
                              title="Edit seat layout"
                              onClick={() => setSeatDialog({ hallId: hall.id, hallName: hall.name })}
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400"
                              title="Delete hall"
                              onClick={() => setDeleteConfirm({ type: "hall", id: hall.id, name: hall.name })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Theater create/edit dialog */}
      <Dialog open={theaterDialog !== null} onOpenChange={(o) => !o && setTheaterDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-red-400" />
              {theaterDialog === "create" ? "Add Theater" : "Edit Theater"}
            </DialogTitle>
          </DialogHeader>
          <TheaterForm
            initial={typeof theaterDialog === "object" && theaterDialog !== null ? theaterDialog : undefined}
            onSave={handleSaveTheater}
            onCancel={() => setTheaterDialog(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Hall create dialog */}
      <Dialog open={hallDialog !== null} onOpenChange={(o) => !o && setHallDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-red-400" />
              Add Hall
            </DialogTitle>
          </DialogHeader>
          {hallDialog && (
            <HallForm
              theaterId={hallDialog}
              onSave={() => { setHallDialog(null); load(); }}
              onCancel={() => setHallDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Seat layout edit dialog */}
      <Dialog open={seatDialog !== null} onOpenChange={(o) => !o && setSeatDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-red-400" />
              Edit Seat Layout — {seatDialog?.hallName}
            </DialogTitle>
          </DialogHeader>
          {seatDialog && (
            <SeatEditModal
              hallId={seatDialog.hallId}
              hallName={seatDialog.hallName}
              onClose={() => setSeatDialog(null)}
              onSaved={load}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(o) => { if (!o) { setDeleteConfirm(null); setDeleteError(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Are you sure you want to delete <span className="text-white font-bold">{deleteConfirm?.name}</span>?
              {deleteConfirm?.type === "theater" && " All associated halls and seats will also be deleted."}
              {deleteConfirm?.type === "hall" && " All seats in this hall will be deleted."}
              {" "}This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">{deleteError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setDeleteConfirm(null); setDeleteError(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
