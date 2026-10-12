"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
  Search,
  MapPin,
  Loader2,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ChevronDown,
  Music,
  Wrench,
  Utensils,
  Trophy,
  Smile,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard, { EventItem } from "@/components/EventCard";

const CATEGORIES = [
  { id: "All", label: "All Events", icon: Sparkles },
  { id: "Music", label: "Music", icon: Music },
  { id: "Workshop", label: "Workshop", icon: Wrench },
  { id: "Food", label: "Food", icon: Utensils },
  { id: "Sports", label: "Sports", icon: Trophy },
  { id: "Kids", label: "Kids", icon: Smile },
] as const;

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
  const [cityOpen, setCityOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Close city popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target as Node)
      ) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        const res = await fetch("/api/events?" + params.toString(), {
          cache: "no-store",
        });
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
    setCityOpen(false);
  }

  function handleReminderSync(eventId: string, isReminded: boolean) {
    if (!user) return;
    const nextReminders = isReminded
      ? [...user.reminders, eventId]
      : user.reminders.filter((id) => id !== eventId);
    setUser({ ...user, reminders: nextReminders });
  }

  const hasActiveFilters =
    category !== "All" || city !== "All" || search.trim() !== "";

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      <Navbar user={user} isAdmin={isAdmin} onUserUpdate={setUser} />

      
     <section className="relative z-50 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="community-wrapper px-5 py-10 sm:p-12 text-center shadow-2xl relative">
          <div className="community-badge mx-auto mb-4">
            <span>Community Events Board</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Discover Live Events{" "}
            <span className="text-gradient-only">Around You</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-3">
            Curated music nights, hands-on workshops, street food carnivals,
            and sports meetups happening in your city.
          </p>

          
          <div className="relative z-50 mt-8 max-w-3xl mx-auto">
            <div className="bg-[#0c0c10]/90 backdrop-blur-xl border border-slate-700/80 focus-within:border-[#4ade80] focus-within:shadow-[0_0_30px_rgba(74,222,128,0.18)] rounded-3xl sm:rounded-full p-2 transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
              
              <div className="flex-1 flex items-center pl-4 pr-2 py-1.5">
                <Search className="w-4 h-4 text-[#4ade80] shrink-0 mr-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search events, vibes, or keywords (e.g. night)..."
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              
              <div className="hidden sm:block w-px h-7 bg-slate-800 mx-1" />

              
              <div
                ref={cityDropdownRef}
               className="relative z-50 flex items-center justify-between sm:justify-start border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0"
              >
                <button
                  type="button"
                  onClick={() => setCityOpen((prev) => !prev)}
                  className="flex-1 sm:flex-initial flex items-center justify-between gap-2.5 px-4 py-2 rounded-full hover:bg-white/5 text-xs sm:text-sm font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span>{city === "All" ? "All Cities" : city}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      cityOpen ? "rotate-180 text-[#4ade80]" : ""
                    }`}
                  />
                </button>

               
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="ml-1 px-4 py-2.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                ) : (
                  <div className="ml-1 px-4 py-2.5 rounded-full bg-[#042f2e] border border-[#4ade80]/30 text-[#4ade80] text-xs font-bold shrink-0">
                    {total} Events
                  </div>
                )}

                
                {cityOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 z-50 bg-[#111116]/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-left">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 mb-1">
                      Filter by City
                    </div>
                    {["All", ...cities].map((c) => {
                      const isSelected = city === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCity(c);
                            setPage(1);
                            setCityOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#042f2e] text-[#4ade80]"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span>{c === "All" ? "All Cities" : c}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            
            <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[#4ade80] text-zinc-950 font-bold shadow-[0_0_20px_rgba(74,222,128,0.35)] scale-[1.03]"
                        : "bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Upcoming Lineup{" "}
              <span className="text-sm font-normal text-[#4ade80]">
                ({total} showing)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Sorted chronologically by nearest upcoming date
            </p>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {category !== "All" && (
                <span className="px-3 py-1 rounded-full bg-[#042f2e] text-[#4ade80] border border-[#4ade80]/30 font-medium">
                  Category: {category}
                </span>
              )}
              {city !== "All" && (
                <span className="px-3 py-1 rounded-full bg-[#042f2e] text-[#4ade80] border border-[#4ade80]/30 font-medium">
                  City: {city}
                </span>
              )}
              {search && (
                <span className="px-3 py-1 rounded-full bg-[#042f2e] text-[#4ade80] border border-[#4ade80]/30 font-medium">
                  Keyword: &ldquo;{search}&rdquo;
                </span>
              )}
            </div>
          )}
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
              clearing your filters.
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