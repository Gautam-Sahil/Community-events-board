"use client";


import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Bell,
  BellRing,
  Sparkles,
  Check,
  X,
  Loader2,
  AlertCircle,
  Palette,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatIndianPrice, formatEventDate } from "@/lib/format";
import { EventItem } from "@/components/EventCard";

type ThemeKey = "sunset" | "ocean" | "midnight";

const THEMES: {
  id: ThemeKey;
  name: string;
  bgStyle: string;
  badge: string;
}[] = [
  {
    id: "sunset",
    name: "Sunset Glow",
    bgStyle: "linear-gradient(135deg, #f43f5e 0%, #f97316 50%, #f59e0b 100%)",
    badge: "bg-white/20 text-white border-white/30",
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    bgStyle: "linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #4ade80 100%)",
    badge: "bg-black/30 text-white border-white/30",
  },
  {
    id: "midnight",
    name: "Midnight Neon",
    bgStyle: "linear-gradient(135deg, #301469 0%, #1e1b4b 50%, #09090b 100%)",
    badge: "bg-indigo-500/30 text-indigo-100 border-indigo-400/30",
  },
];

const STICKERS = [
  { id: "🎸", label: "Rock Guitar" },
  { id: "🍕", label: "Foodie Slice" },
  { id: "🎉", label: "Party Popper" },
  { id: "🔥", label: "Lit Fire" },
  { id: "✨", label: "Sparkle Magic" },
];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  favouriteCategories: string[];
  reminders: string[];
}

function EventDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reminded, setReminded] = useState(false);
  const [remindError, setRemindError] = useState("");

  const [theme, setTheme] = useState<ThemeKey>("ocean");
  const [stickers, setStickers] = useState<string[]>([]);
  const [savingDesign, setSavingDesign] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token
          ? { Authorization: "Bearer " + token }
          : {};

        const [meRes, eventRes] = await Promise.all([
          fetch("/api/auth/me", { headers }),
          fetch("/api/events/" + id, { headers }),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
          setIsAdmin(meData.isAdmin);
        }

        const eventData = await eventRes.json();
        if (!eventRes.ok) {
          throw new Error(eventData.error || "Event not found");
        }

        setEvent(eventData.event);
        setReminded(Boolean(eventData.isReminded));

        if (eventData.cardDesign) {
          setTheme(eventData.cardDesign.theme);
          setStickers(eventData.cardDesign.stickers || []);
        } else {
          const localSaved = localStorage.getItem("card_design_" + id);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            if (parsed.theme) setTheme(parsed.theme);
            if (Array.isArray(parsed.stickers)) setStickers(parsed.stickers);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function persistCardDesign(nextTheme: ThemeKey, nextStickers: string[]) {
    localStorage.setItem(
      "card_design_" + id,
      JSON.stringify({ theme: nextTheme, stickers: nextStickers })
    );

    if (!user) {
      setSaveStatus("Saved on this device");
      setTimeout(() => setSaveStatus(""), 2500);
      return;
    }

    setSavingDesign(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/events/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ theme: nextTheme, stickers: nextStickers }),
      });

      if (res.ok) {
        setSaveStatus("Design synced to account!");
        setTimeout(() => setSaveStatus(""), 2500);
      }
    } finally {
      setSavingDesign(false);
    }
  }

  function handleThemeChange(newTheme: ThemeKey) {
    setTheme(newTheme);
    persistCardDesign(newTheme, stickers);
  }

  function handleAddSticker(emoji: string) {
    if (stickers.length >= 3) return;
    const next = [...stickers, emoji];
    setStickers(next);
    persistCardDesign(theme, next);
  }

  function handleRemoveSticker(indexToRemove: number) {
    const next = stickers.filter((_, idx) => idx !== indexToRemove);
    setStickers(next);
    persistCardDesign(theme, next);
  }

  async function handleRemindToggle() {
    setRemindError("");
    const prev = reminded;
    const next = !prev;
    setReminded(next);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ eventId: id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Please log in first to save event reminders"
        );
      }
    } catch (err: unknown) {
      setReminded(prev);
      setRemindError(
        err instanceof Error ? err.message : "Failed to save reminder"
      );
      setTimeout(() => setRemindError(""), 4000);
    }
  }

  const activeThemeObj =
    THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      <Navbar user={user} isAdmin={isAdmin} onUserUpdate={setUser} />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-[#4ade80] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Board
        </Link>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4ade80] mb-3" />
            <p className="text-sm">Loading event studio...</p>
          </div>
        ) : error || !event ? (
          <div className="py-20 bg-[#111115] rounded-3xl border border-slate-800 text-center p-6">
            <h2 className="text-lg font-bold text-white">
              {error || "Event not found"}
            </h2>
            <Link
              href="/"
              className="mt-4 inline-block px-5 py-2.5 bg-[#4ade80] text-zinc-950 rounded-full text-xs font-bold"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
           
            <div className="bg-[#111115] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-6 h-64 sm:h-80 lg:h-auto bg-zinc-900 relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#042f2e]/90 text-[#4ade80] border border-[#4ade80]/30 backdrop-blur-md">
                  {event.category}
                </span>
              </div>

              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 mb-3">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#4ade80]">
                      <Calendar className="w-4 h-4" />
                      {formatEventDate(event.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {event.city}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {event.title}
                  </h1>

                  <div className="mt-4 inline-block px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#4ade80] font-extrabold text-lg">
                    {formatIndianPrice(event.price)}
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-5">
                    {event.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  {remindError && (
                    <div className="mb-3 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{remindError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Interested in attending?
                      </p>
                      <p className="text-xs text-slate-400">
                        Instant optimistic reminder synced to your profile.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemindToggle}
                      className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        reminded
                          ? "bg-[#4ade80] text-zinc-950 shadow-[0_0_20px_rgba(74,222,128,0.4)] scale-[1.02]"
                          : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                      }`}
                    >
                      {reminded ? (
                        <>
                          <BellRing className="w-4 h-4 animate-bounce" />
                          Reminder Set
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Remind Me
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            
            <section className="bg-[#111115] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#042f2e] text-[#4ade80] border border-[#4ade80]/30">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">
                      Design Your Event Pass Card
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Switch between 3 background themes and add up to 3
                      stickers. Saved across refreshes!
                    </p>
                  </div>
                </div>

                {(savingDesign || saveStatus) && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#042f2e] text-[#4ade80] border border-[#4ade80]/30">
                    {savingDesign ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {savingDesign ? "Saving..." : saveStatus}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      1. Choose Background Theme (3 Options)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeChange(t.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            theme === t.id
                              ? "border-[#4ade80] bg-[#042f2e]/40"
                              : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                          }`}
                        >
                          <div
                            className="h-8 w-full rounded-lg mb-2"
                            style={{ background: t.bgStyle }}
                          />
                          <p className="text-xs font-bold text-white truncate">
                            {t.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        2. Tap to Add Stickers ({stickers.length}/3 Added)
                      </label>
                      {stickers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setStickers([]);
                            persistCardDesign(theme, []);
                          }}
                          className="text-xs font-semibold text-rose-400 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2.5">
                      {STICKERS.map((s) => {
                        const disabled = stickers.length >= 3;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleAddSticker(s.id)}
                            title={s.label}
                            className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-[#4ade80] hover:bg-[#042f2e]/40 disabled:opacity-35 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-90"
                          >
                            <span className="text-2xl">{s.id}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Tip: Tap any sticker on the live preview card to remove
                      it.
                    </p>
                  </div>
                </div>

                {/* Live Animated Preview Card */}
                <div className="lg:col-span-7 flex justify-center">
                  <div
                    style={{ background: activeThemeObj.bgStyle }}
                    className="w-full max-w-md rounded-3xl p-6 sm:p-8 text-white shadow-2xl transition-all duration-500 transform hover:scale-[1.01] relative overflow-hidden border border-white/15"
                  >
                    <div className="w-40 h-40 rounded-full bg-white/10 absolute -top-12 -right-12 blur-xl pointer-events-none" />
                    <div className="w-32 h-32 rounded-full bg-black/20 absolute -bottom-10 -left-10 blur-lg pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-xs ${activeThemeObj.badge}`}
                        >
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {event.category} Pass
                        </span>

                        <span className="text-xs font-bold bg-black/35 px-3 py-1 rounded-full backdrop-blur-xs">
                          {formatIndianPrice(event.price)}
                        </span>
                      </div>

                      <h3 className="text-2xl font-extrabold leading-snug drop-shadow-xs">
                        {event.title}
                      </h3>

                      <div className="mt-4 space-y-1.5 text-sm text-white/90">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 shrink-0" />
                          {formatEventDate(event.date)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          {event.city}
                        </p>
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/20 flex items-center justify-between min-h-[60px]">
                        <div className="flex items-center gap-3">
                          {stickers.length === 0 ? (
                            <span className="text-xs text-white/75 italic">
                              Tap stickers on the left to decorate your card...
                            </span>
                          ) : (
                            stickers.map((emoji, idx) => (
                              <button
                                key={`${emoji}-${idx}`}
                                type="button"
                                onClick={() => handleRemoveSticker(idx)}
                                title="Click to remove sticker"
                                className="group relative w-12 h-12 rounded-2xl bg-white/20 hover:bg-red-500/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-sm transition-all duration-300 animate-bounce cursor-pointer"
                                style={{
                                  animationDuration: `${1.8 + idx * 0.3}s`,
                                }}
                              >
                                <span>{emoji}</span>
                                <span className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                                  <X className="w-2.5 h-2.5" />
                                </span>
                              </button>
                            ))
                          )}
                        </div>

                        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                          {activeThemeObj.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-sm text-slate-400">
          Loading event studio...
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  );
}