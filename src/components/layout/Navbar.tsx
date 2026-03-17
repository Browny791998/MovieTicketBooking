"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Film, Menu, X, User, LogOut, LayoutDashboard, Ticket, MapPin, Info, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 group-hover:bg-red-500 transition-colors shadow-lg shadow-red-900/40">
              <Film className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              DAT<span className="text-red-500">SHIN</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/movies" className="text-sm text-zinc-400 hover:text-white transition-colors">Movies</Link>
            <Link href="/locations" className="text-sm text-zinc-400 hover:text-white transition-colors">Locations</Link>
            <Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-sm text-zinc-400 hover:text-white transition-colors">Contact</Link>
            {session?.user.role === "ADMIN" && (
              <Link href="/admin" className="text-sm text-zinc-400 hover:text-white transition-colors">Admin</Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {session.user.name ?? session.user.email?.split("@")[0]}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="gap-2">
                  <LogOut className="h-4 w-4" />Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
                <Link href="/register"><Button size="sm">Get started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
          <Link href="/movies" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <Film className="h-4 w-4" /> Movies
          </Link>
          <Link href="/locations" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <MapPin className="h-4 w-4" /> Locations
          </Link>
          <Link href="/about" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <Info className="h-4 w-4" /> About
          </Link>
          <Link href="/contact" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <MessageSquare className="h-4 w-4" /> Contact
          </Link>
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white" onClick={() => setMobileOpen(false)}>
              <LayoutDashboard className="h-4 w-4" /> Admin
            </Link>
          )}
          {session ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white" onClick={() => setMobileOpen(false)}>
                <Ticket className="h-4 w-4" /> My Bookings
              </Link>
              <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" size="sm">Sign in</Button></Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}><Button size="sm">Get started</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
