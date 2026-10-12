"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  Calendar,
  MapPin,
  LogOut,
  
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { formatIndianPrice, formatEventDate } from "@/lib/format";

interface EventItem {
  _id: string;
  title: string;
  category: "Music" | "Workshop" | "Food" | "Sports" | "Kids";
  city: string;
  date: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"] as const;
type AdminFilter = "all" | "upcoming" | "inactive" | "past";

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminFilter>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Music");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80"
  );

  useEffect(() => {
    async function fetchAdminEvents() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/events", { cache: "no-store" });
        if (res.status === 401) {
          router.push("/login?role=admin");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load events");
        setEvents(data.events || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminEvents();
  }, [router]);

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          city,
          date,
          price: Number(price),
          description,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      setEvents((prev) =>
        [...prev, data.event].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      setTitle("");
      setCity("");
      setDate("");
      setPrice("");
      setDescription("");
      setFeedback("Event published live to the board!");
      setTimeout(() => setFeedback(""), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create event");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(event: EventItem) {
    setTogglingId(event._id);
    const nextStatus = !event.isActive;

    try {
      const res = await fetch("/api/admin/events/" + event._id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === event._id ? { ...ev, isActive: nextStatus } : ev
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating event status");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("admin_token");
    router.push("/login?role=admin");
    router.refresh();
  }

  const now = new Date();
  const upcomingActiveCount = events.filter(
    (e) => e.isActive && new Date(e.date) >= now
  ).length;
  const inactiveCount = events.filter((e) => !e.isActive).length;
  const pastCount = events.filter((e) => new Date(e.date) < now).length;

  const filteredEvents = events.filter((e) => {
    const isPast = new Date(e.date) < now;
    if (statusFilter === "upcoming") return e.isActive && !isPast;
    if (statusFilter === "inactive") return !e.isActive;
    if (statusFilter === "past") return isPast;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      
      <nav className="cinion-navbar">
        <Link href="/admin" className="logo-gradient">
          EventPulse <span className="text-xs font-semibold text-slate-400">ADMIN</span>
        </Link>

        <div className="rainbow hidden md:block">
          <div className="cinion-nav-inner">
            <Link href="/admin" className="active-link">
              Command Studio
            </Link>
            <Link href="/">
              
              Visitor Board
            </Link>
            <Link href="/feed">
              User Feed
            </Link>
          </div>
        </div>

        <div className="cinion-right">
          <Link
            href="/"
            className="md:hidden px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white"
          >
            Visitor View
          </Link>
          <div className="button-bg">
            <button type="button" onClick={handleLogout} className="login-btn">
              <LogOut className="w-4 h-4 text-rose-400" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      
      <section className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="community-wrapper p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="community-badge mb-3">
                <span>Admin Control Center</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Manage Community <span className="text-gradient-only">Lineup</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Publish new events or toggle visibility without ever deleting records.
              </p>
            </div>

            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/45 border border-white/10 rounded-2xl p-3.5 text-center backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Total Seeded
                </p>
                <p className="text-2xl font-extrabold text-white mt-0.5">
                  {events.length}
                </p>
              </div>

              <div className="bg-[#042f2e]/60 border border-[#4ade80]/40 rounded-2xl p-3.5 text-center backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-wider text-[#4ade80] font-semibold">
                  Visitor Live
                </p>
                <p className="text-2xl font-extrabold text-[#4ade80] mt-0.5">
                  {upcomingActiveCount}
                </p>
              </div>

              <div className="bg-black/45 border border-amber-500/30 rounded-2xl p-3.5 text-center backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                  Past Dates
                </p>
                <p className="text-2xl font-extrabold text-amber-400 mt-0.5">
                  {pastCount}
                </p>
              </div>

              <div className="bg-black/45 border border-rose-500/30 rounded-2xl p-3.5 text-center backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold">
                  Inactive
                </p>
                <p className="text-2xl font-extrabold text-rose-400 mt-0.5">
                  {inactiveCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        <section className="lg:col-span-5">
          <div className="bg-[#111115] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#042f2e] border border-[#4ade80]/30 flex items-center justify-center text-[#4ade80]">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  Launch New Event
                </h2>
                <p className="text-xs text-slate-400">
                  Instantly goes live on the Visitor Board
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs">
                {error}
              </div>
            )}

            {feedback && (
              <div className="mb-4 p-3 rounded-xl bg-[#042f2e] border border-[#4ade80]/40 text-[#4ade80] text-xs font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                {feedback}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Midnight Synthwave Rooftop Jam"
                  className="w-full px-3.5 py-2.5 custom-dark-input text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-2">
      Category
    </label>

    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center">
        <Layers className="w-4 h-4 text-[#4ade80]" />
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full h-[52px] appearance-none rounded-2xl border border-slate-700/80 bg-[#151519] pl-14 pr-10 text-sm font-medium text-white outline-none transition-all hover:border-slate-500 focus:border-[#4ade80]/70 focus:ring-2 focus:ring-[#4ade80]/10 cursor-pointer"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat} className="bg-[#111115] text-white">
            {cat}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4ade80]" />
    </div>
  </div>

  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-2">
      City
    </label>

    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center">
        <MapPin className="w-4 h-4 text-[#4ade80]" />
      </div>

      <input
        type="text"
        required
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="e.g., Coimbatore"
        className="w-full h-[52px] rounded-2xl border border-slate-700/80 bg-[#151519] pl-14 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all hover:border-slate-500 focus:border-[#4ade80]/70 focus:ring-2 focus:ring-[#4ade80]/10"
      />
    </div>
  </div>
</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-2">
      Event Schedule
    </label>

    <div className="rounded-2xl border border-slate-700/80 bg-[#151519] p-3 transition-all hover:border-slate-500 focus-within:border-[#4ade80]/70">
      <div className="flex items-center gap-3 mb-3">
       <div className="w-10 h-10 rounded-xl bg-[#4ade80]/15 border border-[#4ade80]/30 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.08)]">
  <Calendar className="w-5 h-5 text-[#4ade80]" />
</div>

        <div>
          <p className="text-sm font-semibold text-white">Date & Time</p>
          <p className="text-[10px] text-slate-500">
            Select event start time
          </p>
        </div>
      </div>

      <input
        type="datetime-local"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="event-datetime w-full min-w-0 h-11 rounded-xl border border-slate-700/70 bg-black/30 px-2 text-xs sm:text-sm text-white outline-none "
      />
    </div>
  </div>

  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-2">
      Ticket Price
      <span className="ml-2 text-[10px] text-slate-500">INR / ticket</span>
    </label>

    <div className="flex items-center h-[52px] rounded-2xl border border-slate-700/80 bg-[#151519] transition-all hover:border-slate-500 focus-within:border-[#4ade80]/70 focus-within:ring-2 focus-within:ring-[#4ade80]/10">
      <div className="ml-3 w-8 h-8 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-[#4ade80]">₹</span>
      </div>

      <input
        type="number"
        min="0"
        step="1"
        required
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="0"
        className="price-input w-full min-w-0 h-full bg-transparent px-3 text-sm font-semibold text-white placeholder:text-slate-600 outline-none"
      />

      <span className="mr-3 rounded-lg border border-slate-700/70 px-2 py-1 text-[10px] font-semibold text-slate-500">
        INR
      </span>
    </div>

    <p className="mt-2 text-[10px] text-slate-500">
      Enter 0 for a free event
    </p>
  </div>
</div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 custom-dark-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell visitors what makes this event special..."
                  className="w-full px-3.5 py-2.5 custom-dark-input text-sm"
                />
              </div>

              <div className="pt-2">
                <div className="button-bg w-full">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="login-btn w-full justify-center py-3 text-sm font-bold"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing Event...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-[#4ade80]" />
                        Publish Event to Board
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        
        <section className="lg:col-span-7">
          <div className="bg-[#111115] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#4ade80]" />
                  Event Inventory ({filteredEvents.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visitor board automatically shows only{" "}
                  <span className="text-[#4ade80] font-semibold">
                    Active + Upcoming
                  </span>{" "}
                  events.
                </p>
              </div>

              
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: "all", label: `All (${events.length})` },
                    {
                      id: "upcoming",
                      label: `Visitor Live (${upcomingActiveCount})`,
                    },
                    { id: "inactive", label: `Inactive (${inactiveCount})` },
                    { id: "past", label: `Past (${pastCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? "bg-[#4ade80] text-zinc-950 shadow-[0_0_12px_rgba(74,222,128,0.35)]"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#4ade80] mb-2" />
                <p className="text-sm">Loading event inventory...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <p className="font-semibold text-white">
                  No events in this filter tab.
                </p>
                <p className="text-xs mt-1">
                  Switch tabs above or publish a new event on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredEvents.map((ev) => {
                  const isPast = new Date(ev.date) < now;
                  const isLiveOnVisitorBoard = ev.isActive && !isPast;

                  return (
                    <div
                      key={ev._id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isLiveOnVisitorBoard
                          ? "border-slate-800 bg-slate-900/40 hover:border-[#4ade80]/40"
                          : "border-slate-800/60 bg-zinc-950/60 opacity-75"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-white/10">
                          <img
                            src={ev.imageUrl}
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#042f2e] text-[#4ade80] border border-[#4ade80]/30">
                              {ev.category}
                            </span>

                            {isPast ? (
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Past Date (Hidden)
                              </span>
                            ) : null}

                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                ev.isActive
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {ev.isActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-400" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </div>

                          <Link
                            href={"/events/" + ev._id}
                            className="font-bold text-white hover:text-[#4ade80] transition-colors text-base line-clamp-1"
                          >
                            {ev.title}
                          </Link>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                              {ev.city}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#4ade80]" />
                              {formatEventDate(ev.date)}
                            </span>
                            <span className="font-bold text-[#4ade80]">
                              {formatIndianPrice(ev.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(ev)}
                          disabled={togglingId === ev._id}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            ev.isActive
                              ? "bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-500/40 text-slate-200 border border-slate-700"
                              : "bg-[#4ade80] hover:bg-[#34d399] text-zinc-950 shadow-[0_0_15px_rgba(74,222,128,0.35)]"
                          }`}
                        >
                          {togglingId === ev._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : ev.isActive ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          {ev.isActive ? "Set Inactive" : "Set Active"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}