import type { Metadata } from "next";
import { Film, Star, Users, Ticket, Award, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Dat Shin",
  description: "Learn about Dat Shin — Yangon's premier cinema experience.",
};

const STATS = [
  { value: "2", label: "Theaters", icon: Film },
  { value: "16", label: "Screens", icon: Star },
  { value: "50K+", label: "Happy Guests", icon: Users },
  { value: "200+", label: "Movies Screened", icon: Ticket },
];

const VALUES = [
  {
    icon: Star,
    title: "Premium Experience",
    description:
      "From IMAX to 4DX, we invest in the best projection and sound technology so every frame feels alive.",
  },
  {
    icon: Heart,
    title: "Passion for Cinema",
    description:
      "Founded by film lovers, Dat Shin exists to celebrate storytelling on the big screen — from blockbusters to indie gems.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We host weekly screenings, Q&As with filmmakers, and special events that bring the cinema community together.",
  },
  {
    icon: Award,
    title: "Award-Winning Service",
    description:
      "Voted Yangon&apos;s best cinema experience three years running. Our staff are trained to make every visit memorable.",
  },
];

const TIMELINE = [
  { year: "2018", event: "Dat Shin Downtown opens in Kyauktada with 8 screens." },
  { year: "2020", event: "Launched online booking and Redis-powered seat locking system." },
  { year: "2022", event: "Dat Shin Junction opens in Kamayut with Yangon's first commercial 4DX hall." },
  { year: "2023", event: "Passed 50,000 guests served. Introduced IMAX laser projection." },
  { year: "2024", event: "Launched Dat Shin membership rewards program." },
  { year: "2025", event: "Expanding to Thingangyun and Insein locations." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/60 bg-zinc-950 py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-red-600/5 blur-3xl" />
          <div className="absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full bg-red-600/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-800/40 bg-red-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-400">
            <Film className="h-3.5 w-3.5" />
            Est. 2018 · Yangon, Myanmar
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
            We Live For
            <span className="text-red-500"> Cinema</span>
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Dat Shin is Yangon&apos;s most beloved cinema destination — where state-of-the-art
            technology meets warm hospitality and an unwavering love for film.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-800/60 bg-zinc-900/40 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 border border-red-800/30">
                  <Icon className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="text-sm text-zinc-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-3">
              Our Story
            </p>
            <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
              Born from a love of the big screen
            </h2>
            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
              <p>
                Dat Shin began as a single 8-screen multiplex in Kyauktada, founded by a group
                of friends who believed Yangon deserved a cinema that treated every film — from
                summer blockbusters to quiet arthouse releases — with equal reverence.
              </p>
              <p>
                We obsess over every detail: acoustics tuned by award-winning sound engineers,
                seats designed for a 3-hour epic, and a concession menu that goes far beyond
                popcorn. We want you to forget the outside world the moment you walk through
                our doors.
              </p>
              <p>
                Today we operate two locations with 16 screens, including Yangon&apos;s finest IMAX
                and 4DX halls — and we&apos;re just getting started.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pl-6 border-l border-zinc-800 space-y-7">
            {TIMELINE.map(({ year, event }) => (
              <div key={year} className="relative">
                <div className="absolute -left-[29px] flex h-5 w-5 items-center justify-center rounded-full border border-red-700 bg-red-600/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                </div>
                <p className="text-xs font-bold text-red-400 mb-0.5">{year}</p>
                <p className="text-sm text-zinc-400">{event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-zinc-800/60 bg-zinc-900/20 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">
              What We Stand For
            </p>
            <h2 className="text-3xl font-bold text-white">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-3 hover:border-red-800/40 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-800/30">
                  <Icon className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
