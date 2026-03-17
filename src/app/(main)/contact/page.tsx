"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@datshin.com.mm",
    href: "mailto:hello@datshin.com.mm",
  },
  {
    icon: Phone,
    label: "Downtown (Kyauktada)",
    value: "+95 9-1234-56789",
    href: "tel:+959123456789",
  },
  {
    icon: Phone,
    label: "Junction (Kamayut)",
    value: "+95 9-9876-54321",
    href: "tel:+959987654321",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Daily 09:00–22:00 MMT",
    href: null,
  },
];

const FAQ = [
  {
    q: "Can I change or cancel my booking?",
    a: "Bookings can be modified up to 30 minutes before showtime. Log in to your profile and select the booking to make changes.",
  },
  {
    q: "Do you offer group bookings?",
    a: "Yes! For groups of 10 or more, contact us directly for discounted group rates and reserved sections.",
  },
  {
    q: "Is there parking available?",
    a: "Both locations have nearby paid parking. We validate up to 2 hours with a ticket purchase.",
  },
  {
    q: "Do you have accessibility facilities?",
    a: "All our screens are wheelchair accessible with designated seating. Audio description and closed-caption devices are available at the box office.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards and digital payments (Wave Money, KBZPay, AYAPay) online and at the box office.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/60 bg-zinc-950 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-red-600/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-800/40 bg-red-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-400">
            <MessageSquare className="h-3.5 w-3.5" />
            We&apos;re Here to Help
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-5">
            Get In
            <span className="text-red-500"> Touch</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Questions about bookings, group events, or just want to say hello?
            We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-[1fr_420px] gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">Send us a Message</h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-green-800/40 bg-green-950/30 py-16 text-center">
              <CheckCircle2 className="h-14 w-14 text-green-400" />
              <div>
                <p className="text-xl font-bold text-white">Message Sent!</p>
                <p className="text-sm text-zinc-400 mt-1">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="text-sm text-red-400 hover:text-red-300 mt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Your Name</Label>
                  <Input
                    placeholder="Ko Aung"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="koaung@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input
                  placeholder="Booking issue, group inquiry..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea
                  rows={6}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" size="lg" disabled={loading} className="gap-2 w-full sm:w-auto">
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}

          {/* FAQ */}
          <div className="mt-14">
            <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {FAQ.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 cursor-pointer"
                >
                  <summary className="flex items-center justify-between gap-2 text-sm font-medium text-zinc-200 list-none select-none">
                    {q}
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform shrink-0 text-lg leading-none">›</span>
                  </summary>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar contact info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <h3 className="font-semibold text-white">Contact Information</h3>
            {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600/10 border border-red-800/30">
                  <Icon className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm text-zinc-300 hover:text-white transition-colors">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-zinc-300">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map placeholder cards */}
          {[
            { name: "Downtown", area: "Kyauktada", mapUrl: "https://maps.google.com/?q=Kyauktada+Yangon+Myanmar" },
            { name: "Junction", area: "Kamayut", mapUrl: "https://maps.google.com/?q=Kamayut+Yangon+Myanmar" },
          ].map(({ name, area, mapUrl }) => (
            <div key={name} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              {/* Map visual placeholder */}
              <div className="relative h-32 bg-zinc-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.08),transparent_70%)]" />
                <div className="flex flex-col items-center gap-1 text-center">
                  <MapPin className="h-6 w-6 text-red-500" />
                  <p className="text-xs text-zinc-500 font-medium">{area}, Yangon</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Dat Shin {name}</p>
                  <p className="text-xs text-zinc-500">{area}</p>
                </div>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Directions →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
