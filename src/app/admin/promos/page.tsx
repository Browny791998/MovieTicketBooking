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
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Percent, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

type PromoType = "PERCENTAGE" | "FIXED";
type PromoScope = "ALL" | "IMAX" | "FOURDX" | "STANDARD";

interface PromoCode {
  id: string;
  code: string;
  description: string;
  type: PromoType;
  value: number;
  scope: PromoScope;
  minAmount: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const SCOPE_LABELS: Record<PromoScope, string> = {
  ALL: "All Halls",
  IMAX: "IMAX Only",
  FOURDX: "4DX Only",
  STANDARD: "Standard Only",
};

function PromoForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<PromoCode>;
  onSave: (data: Partial<PromoCode>) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<PromoType>(initial?.type ?? "PERCENTAGE");
  const [value, setValue] = useState(String(initial?.value ?? "10"));
  const [scope, setScope] = useState<PromoScope>(initial?.scope ?? "ALL");
  const [minAmount, setMinAmount] = useState(String(initial?.minAmount ?? "0"));
  const [maxUses, setMaxUses] = useState(initial?.maxUses != null ? String(initial.maxUses) : "");
  const [expiresAt, setExpiresAt] = useState(
    initial?.expiresAt ? initial.expiresAt.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const numVal = parseFloat(value);
    if (!code.trim() || !description.trim()) { setError("Code and description are required"); return; }
    if (isNaN(numVal) || numVal <= 0) { setError("Value must be a positive number"); return; }
    if (type === "PERCENTAGE" && numVal > 100) { setError("Percentage cannot exceed 100"); return; }
    setSaving(true);
    try {
      await onSave({
        code,
        description,
        type,
        value: numVal,
        scope,
        minAmount: parseFloat(minAmount) || 0,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt || null,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error ?? "Failed");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Promo Code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUMMER20"
            className="font-mono font-bold"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Applies To</Label>
          <Select value={scope} onValueChange={(v) => setScope(v as PromoScope)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Halls</SelectItem>
              <SelectItem value="IMAX">IMAX Only</SelectItem>
              <SelectItem value="FOURDX">4DX Only</SelectItem>
              <SelectItem value="STANDARD">Standard Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 20% off summer bookings" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Discount Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as PromoType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
              <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Discount Value {type === "PERCENTAGE" ? "(%)" : "($)"}</Label>
          <Input
            type="number"
            min={type === "PERCENTAGE" ? 1 : 0.01}
            max={type === "PERCENTAGE" ? 100 : undefined}
            step={type === "PERCENTAGE" ? 1 : 0.01}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Min. Order ($)</Label>
          <Input type="number" min={0} step={0.01} value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Max Uses (optional)</Label>
          <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" />
        </div>
        <div className="space-y-1.5">
          <Label>Expires (optional)</Label>
          <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : (initial?.id ? "Update Code" : "Create Code")}</Button>
      </div>
    </form>
  );
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<"create" | PromoCode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PromoCode | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get("/api/admin/promos");
      setPromos(r.data);
    } catch {
      // session not ready yet or unauthorized — silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<PromoCode>) => {
    if (dialog === "create") {
      await axios.post("/api/admin/promos", data);
    } else if (dialog && typeof dialog === "object") {
      await axios.patch(`/api/admin/promos/${dialog.id}`, data);
    }
    setDialog(null);
    load();
  };

  const toggleActive = async (promo: PromoCode) => {
    await axios.patch(`/api/admin/promos/${promo.id}`, { active: !promo.active });
    load();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteError("");
    try {
      await axios.delete(`/api/admin/promos/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      load();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setDeleteError(err.response?.data?.error ?? "Failed");
    }
  };

  const isExpired = (p: PromoCode) => p.expiresAt ? new Date(p.expiresAt) < new Date() : false;
  const isMaxed = (p: PromoCode) => p.maxUses !== null && p.usedCount >= p.maxUses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Promo Codes</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {promos.filter((p) => p.active).length} active · {promos.length} total
          </p>
        </div>
        <Button onClick={() => setDialog("create")} className="gap-2">
          <Plus className="h-4 w-4" /> Create Promo Code
        </Button>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : promos.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/5 p-12 text-center">
          <Tag className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No promo codes yet</p>
          <p className="text-zinc-600 text-sm mt-1">Create a promo code to offer discounts to customers</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-white/5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {["Code", "Description", "Discount", "Scope", "Usage", "Expiry", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-4 text-left font-bold text-zinc-400 uppercase tracking-widest text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {promos.map((promo) => {
                const expired = isExpired(promo);
                const maxed = isMaxed(promo);
                const effectivelyInactive = !promo.active || expired || maxed;

                return (
                  <tr key={promo.id} className={cn("premium-table-row group", effectivelyInactive && "opacity-60")}>
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-white tracking-wide">{promo.code}</span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 max-w-[200px] truncate">{promo.description}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {promo.type === "PERCENTAGE"
                          ? <><Percent className="h-3.5 w-3.5 text-emerald-400" /><span className="font-bold text-emerald-400">{promo.value}%</span></>
                          : <><DollarSign className="h-3.5 w-3.5 text-blue-400" /><span className="font-bold text-blue-400">{formatCurrency(promo.value)}</span></>
                        }
                        {promo.minAmount > 0 && (
                          <span className="text-[10px] text-zinc-600">min {formatCurrency(promo.minAmount)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className="text-xs">{SCOPE_LABELS[promo.scope]}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs">
                        <span className="text-zinc-300 font-bold">{promo.usedCount}</span>
                        <span className="text-zinc-600"> / {promo.maxUses ?? "∞"}</span>
                      </div>
                      {promo.maxUses && (
                        <div className="w-16 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${Math.min((promo.usedCount / promo.maxUses) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {promo.expiresAt
                        ? <span className={cn(expired ? "text-red-400" : "text-zinc-400")}>
                            {expired ? "Expired " : ""}
                            {new Date(promo.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        : <span className="text-zinc-600">No expiry</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      {expired ? (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      ) : maxed ? (
                        <Badge variant="secondary" className="text-xs">Maxed</Badge>
                      ) : promo.active ? (
                        <Badge variant="success" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-white"
                          title={promo.active ? "Deactivate" : "Activate"}
                          onClick={() => toggleActive(promo)}
                        >
                          {promo.active
                            ? <ToggleRight className="h-4 w-4 text-emerald-400" />
                            : <ToggleLeft className="h-4 w-4" />
                          }
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-white"
                          onClick={() => setDialog(promo)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400"
                          onClick={() => setDeleteConfirm(promo)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-red-400" />
              {dialog === "create" ? "Create Promo Code" : "Edit Promo Code"}
            </DialogTitle>
          </DialogHeader>
          <PromoForm
            initial={dialog !== "create" && dialog !== null ? dialog : undefined}
            onSave={handleSave}
            onCancel={() => setDialog(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(o) => { if (!o) { setDeleteConfirm(null); setDeleteError(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Delete promo code <span className="font-mono font-bold text-white">{deleteConfirm?.code}</span>? This cannot be undone.
            </p>
            {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
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
