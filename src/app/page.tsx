"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Search,
  MapPin,
  Filter,
  Loader2,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard, { EventItem } from "@/components/EventCard";

const CATEGORIES = ["All", "Music", "Workshop", "Food", "Sports", "Kids"];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  favouriteCategories: string[];
  reminders: string[];
}

function EventsBoardContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsAdmin(data.isAdmin);
        }
      } catch {
        // Guest visitor
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    let active = true;
    async function loadEvents() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          category,
          city,
          search,
          page: String(page),
          limit: "6",
        });

        const res = await fetch("/api/events?" + params.toString());
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load events");

        if (active) {
          setEvents(data.events || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
          if (data.cities?.length) {
            setCities(data.cities);
          }
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Error loading events"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(loadEvents, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [category, city, search, page]);

  function handleResetFilters() {
    setCategory("All");
    setCity("All");
    setSearch("");
    setPage(1);
  }

  function handleReminderSync(eventId: string, isReminded: boolean) {
    if (!user) return;
    const nextReminders = isReminded
      ? [...user.reminders, eventId]
      : user.reminders.filter((id) => id !== eventId);
    setUser({ ...user, reminders: nextReminders });
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      <Navbar user={user} isAdmin={isAdmin} onUserUpdate={setUser} />

      
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="community-wrapper p-6 sm:p-10 text-center shadow-2xl">
          <div className="community-badge mx-auto mb-4">
            <span>Community Events Board</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Experience Live Events{" "}
            <span className="text-gradient-only">Near Your City</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-3">
            Discover acoustic music nights, workshops, street food carnivals,
            and sports tournaments curated for your local community.
          </p>

         
          <div className="mt-8 bg-black/50 backdrop-blur-md border border-slate-800 p-3 sm:p-4 rounded-2xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 text-left">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title or vibe (e.g., night, AI)..."
                className="w-full pl-10 pr-4 py-2.5 custom-dark-input text-sm"
              />
            </div>

            <div className="md:col-span-3 relative">
              <MapPin className="w-4 h-4 text-[#4ade80] absolute left-3.5 top-3.5" />
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 custom-dark-input text-sm"
              >
                <option value="All" className="bg-zinc-900 text-white">
                  All Cities
                </option>
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Filter className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 custom-dark-input text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-zinc-900 text-white"
                    >
                      {cat === "All" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {(category !== "All" || city !== "All" || search !== "") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

        
          <div className="flex items-center justify-center gap-2 flex-wrap pt-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  category === cat
                    ? "bg-[#4ade80] text-zinc-950 shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                    : "bg-white/5 text-slate-300 border border-white/10 hover:border-[#4ade80]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

     
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Upcoming Lineup{" "}
              <span className="text-sm font-normal text-[#4ade80]">
                ({total} active)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Sorted chronologically by nearest upcoming date
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4ade80] mb-3" />
            <p className="text-sm">Loading upcoming events...</p>
          </div>
        ) : error ? (
          <div className="py-16 bg-red-950/40 border border-red-500/30 rounded-2xl text-center p-6">
            <p className="text-red-300 font-semibold">{error}</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-full text-xs font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 bg-[#111115] border border-slate-800 rounded-3xl text-center p-6">
            <CalendarX className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">
              No matching upcoming events
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              No active upcoming events matched your filter combination. Try
              resetting your filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 px-5 py-2.5 bg-[#4ade80] text-zinc-950 rounded-full text-xs font-bold cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <EventCard
                  key={ev._id}
                  event={ev}
                  isLoggedIn={!!user}
                  initialReminded={
                    user ? user.reminders.includes(ev._id) : false
                  }
                  onReminderChange={handleReminderSync}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-5 py-2.5 rounded-full border border-slate-800 bg-[#111115] text-slate-200 text-xs font-semibold hover:border-[#4ade80] disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-400 px-3">
                  Page <span className="text-[#4ade80]">{page}</span> of{" "}
                  {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-5 py-2.5 rounded-full border border-slate-800 bg-[#111115] text-slate-200 text-xs font-semibold hover:border-[#4ade80] disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-sm text-slate-400">
          Loading EventPulse...
        </div>
      }
    >
      <EventsBoardContent />
    </Suspense>
  );
}