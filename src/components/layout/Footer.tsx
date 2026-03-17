import Link from "next/link";
import { Film, Mail, Phone, MapPin } from "lucide-react";

const NAV_LINKS = [
  { href: "/movies", label: "Movies" },
  { href: "/locations", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const LOCATIONS = [
  { name: "Dat Shin Downtown", area: "Kyauktada" },
  { name: "Dat Shin Junction", area: "Kamayut" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 group-hover:bg-red-500 transition-colors">
                <Film className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                DAT<span className="text-red-500">SHIN</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Yangon&apos;s most loved cinema destination. IMAX · 4DX · Dolby Atmos — experience film the way it was meant to be seen.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Explore</p>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Locations</p>
            <ul className="space-y-3">
              {LOCATIONS.map(({ name, area }) => (
                <li key={name}>
                  <Link href="/locations" className="group flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-400 group-hover:text-white transition-colors">{name}</p>
                      <p className="text-xs text-zinc-600">{area}, Yangon</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Contact</p>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@datshin.com.mm" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
                  <Mail className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  hello@datshin.com.mm
                </a>
              </li>
              <li>
                <a href="tel:+959123456789" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
                  <Phone className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  +95 9-1234-56789
                </a>
              </li>
              <li className="pt-1">
                <p className="text-xs text-zinc-600">Support: Daily 09:00–22:00 MMT</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Dat Shin Cinema. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-zinc-600">
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Terms of Use</Link>
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
