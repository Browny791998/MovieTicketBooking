import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: "violet" | "emerald" | "blue" | "amber";
}

const colorMap = {
  violet: "bg-red-600/10 text-red-400 border-red-800/30",
  emerald: "bg-emerald-600/10 text-emerald-400 border-emerald-800/30",
  blue: "bg-blue-600/10 text-blue-400 border-blue-800/30",
  amber: "bg-amber-600/10 text-amber-400 border-amber-800/30",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = "violet",
}: StatsCardProps) {
  return (
    <div className="glass-card liquid-border rounded-[24px] p-6 shadow-xl group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
          {description && (
            <p className="text-xs text-zinc-500 font-medium">{description}</p>
          )}
        </div>
        <div className={cn("rounded-2xl p-3 border shadow-lg group-hover:scale-110 transition-all duration-300", colorMap[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
