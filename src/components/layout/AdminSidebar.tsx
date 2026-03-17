"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  CalendarDays,
  Ticket,
  ArrowLeft,
  BarChart3,
  Building2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/movies", label: "Movies", icon: Film },
  { href: "/admin/showtimes", label: "Showtimes", icon: CalendarDays },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/theaters", label: "Theaters & Halls", icon: Building2 },
  { href: "/admin/promos", label: "Promo Codes", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-white/5 glass-card min-h-screen flex flex-col shadow-2xl z-20">
      <div className="p-8 flex-1">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2 lg:scale-110 origin-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-white text-lg tracking-tighter uppercase italic">
            Admin<span className="text-red-500">CP</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 relative group",
                  isActive
                    ? "text-white bg-white/[0.05] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                )}
                <Icon className={cn("h-4.5 w-4.5 transition-colors", isActive ? "text-red-500" : "group-hover:text-red-400")} />
                <span className="tracking-tight">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Back to site */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all duration-300 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Live Site
        </Link>
      </div>
    </aside>
  );
}
