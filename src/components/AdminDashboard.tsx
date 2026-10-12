"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  Calendar,
  MapPin,
  LogOut,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
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

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

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
        const res = await fetch("/api/admin/events");
        if (res.status === 401) {
          router.push("/admin/login");
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
      setFeedback("Event published successfully!");
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
      const res = await fetch(`/api/admin/events/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setEvents((prev) =>
        prev.map((ev) => (ev._id === event._id ? { ...ev, isActive: nextStatus } : ev))
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
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              CE
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500">Community Events Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Visitor View</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
       
        <section className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Post New Event</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {feedback && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {feedback}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Acoustic Indie Music Night"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Coimbatore"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 1500"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what visitors can expect at this event..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing Event...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Events ({events.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Toggle events Active or Inactive. Events are never deleted.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  Active: {events.filter((e) => e.isActive).length}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                  Inactive: {events.filter((e) => !e.isActive).length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <p className="text-sm">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <p className="font-medium">No events found in the database.</p>
                <p className="text-sm mt-1">Use the form to add your first event.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => {
                  const isPast = new Date(ev.date) < new Date();
                  return (
                    <div
                      key={ev._id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        ev.isActive
                          ? "border-slate-200 bg-white"
                          : "border-slate-200 bg-slate-50/80 opacity-75"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                              {ev.category}
                            </span>
                            {isPast && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                                Past Event
                              </span>
                            )}
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                ev.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {ev.isActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" /> Inactive
                                </>
                              )}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {ev.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {ev.city}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatEventDate(ev.date)}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {formatIndianPrice(ev.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <button
                          onClick={() => handleToggleActive(ev)}
                          disabled={togglingId === ev._id}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            ev.isActive
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {togglingId === ev._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : null}
                          {ev.isActive ? "Mark Inactive" : "Mark Active"}
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