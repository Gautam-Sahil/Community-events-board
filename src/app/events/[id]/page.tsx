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
  QrCode,
  RotateCcw,
  Layers,
  Sticker,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatIndianPrice, formatEventDate } from "@/lib/format";
import { EventItem } from "@/components/EventCard";
import { fetchJson } from "@/lib/fetchJson";

type ThemeKey = "sunset" | "ocean" | "midnight";

const THEMES: {
  id: ThemeKey;
  name: string;
  subtitle: string;
  bgStyle: string;
  accentColor: string;
  ringClass: string;
  swatches: [string, string, string];
}[] = [
  {
    id: "sunset",
    name: "Sunset Glow",
    subtitle: "Solar Crimson & Amber Foil",
    bgStyle:
      "linear-gradient(145deg, #be123c 0%, #ea580c 52%, #d97706 100%)",
    accentColor: "#fb923c",
    ringClass: "border-orange-400 bg-orange-500/10",
    swatches: ["#f43f5e", "#f97316", "#f59e0b"],
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    subtitle: "Emerald Cyber & Deep Teal",
    bgStyle:
      "linear-gradient(145deg, #042f2e 0%, #0f766e 50%, #10b981 100%)",
    accentColor: "#4ade80",
    ringClass: "border-[#4ade80] bg-[#042f2e]/50",
    swatches: ["#042f2e", "#0d9488", "#4ade80"],
  },
  {
    id: "midnight",
    name: "Midnight Neon",
    subtitle: "Obsidian Violet & Cyber Indigo",
    bgStyle:
      "linear-gradient(145deg, #09090b 0%, #1e1b4b 50%, #581c87 100%)",
    accentColor: "#a855f7",
    ringClass: "border-purple-400 bg-purple-500/10",
    swatches: ["#09090b", "#312e81", "#7e22ce"],
  },
];

const STICKERS = [
  { id: "🎸", label: "Acoustic Vibe" },
  { id: "🍕", label: "Street Foodie" },
  { id: "🎉", label: "Festival Crew" },
  { id: "🔥", label: "Mainstage Heat" },
  { id: "✨", label: "VIP All-Access" },
];

const STICKER_PLACEMENTS = [
  { rotate: "-10deg", translateY: "0px" },
  { rotate: "8deg", translateY: "-6px" },
  { rotate: "-5deg", translateY: "2px" },
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

  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 30,
    isHovering: false,
  });

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

        const meResult = await fetchJson<{
          user: UserProfile | null;
          isAdmin: boolean;
        }>("/api/auth/me", { headers });

        if (meResult.ok) {
          setUser(meResult.data.user);
          setIsAdmin(meResult.data.isAdmin);
        }

        const eventResult = await fetchJson<{
          event?: EventItem;
          isReminded?: boolean;
          cardDesign?: { theme: ThemeKey; stickers: string[] } | null;
          error?: string;
        }>("/api/events/" + id, { headers });

        if (!eventResult.ok || !eventResult.data.event) {
          throw new Error(eventResult.data.error || "Event not found");
        }

        setEvent(eventResult.data.event);
        setReminded(Boolean(eventResult.data.isReminded));

        if (eventResult.data.cardDesign) {
          setTheme(eventResult.data.cardDesign.theme);
          setStickers(eventResult.data.cardDesign.stickers || []);
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
      setSaveStatus("Saved to browser storage");
      setTimeout(() => setSaveStatus(""), 2500);
      return;
    }

    setSavingDesign(true);
    try {
      const token = localStorage.getItem("token");
      const { ok } = await fetchJson("/api/events/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ theme: nextTheme, stickers: nextStickers }),
      });

      if (ok) {
        setSaveStatus("Synced to your account");
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

  function handleCardMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    const glareX = Math.round((x / rect.width) * 100);
    const glareY = Math.round((y / rect.height) * 100);

    setTilt({
      rotateX,
      rotateY,
      glareX,
      glareY,
      isHovering: true,
    });
  }

  function handleCardMouseLeave() {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 30,
      isHovering: false,
    });
  }

  async function handleRemindToggle() {
    setRemindError("");
    const prev = reminded;
    const next = !prev;
    setReminded(next);

    try {
      const token = localStorage.getItem("token");
      const { ok, data } = await fetchJson<{ error?: string }>(
        "/api/user/reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: JSON.stringify({ eventId: id }),
        }
      );

      if (!ok) {
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
  const passSerial = id ? id.slice(-6).toUpperCase() : "EP2026";

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

            <section className="rounded-3xl border border-slate-800/90 bg-[#0c0c10] overflow-hidden shadow-2xl">
              <div className="px-6 sm:px-8 py-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-[#111116]">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]" />
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#4ade80] block">
                      INTERACTIVE COLLECTIBLE STUDIO
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Customize Your Collectible Event Pass
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(savingDesign || saveStatus) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#042f2e] text-[#4ade80] border border-[#4ade80]/30">
                      {savingDesign ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      {savingDesign ? "Syncing..." : saveStatus}
                    </span>
                  )}

                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                    PASS ID #{passSerial}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-6 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#4ade80]" />
                        01. Select Foil Finish
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {activeThemeObj.name}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {THEMES.map((t) => {
                        const isSelected = theme === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleThemeChange(t.id)}
                            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                              isSelected
                                ? `\${t.ringClass} shadow-lg`
                                : "border-slate-800/90 bg-[#121218] hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className="w-12 h-12 rounded-xl shrink-0 border border-white/20 shadow-inner relative overflow-hidden"
                                style={{ background: t.bgStyle }}
                              >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_60%)]" />
                              </div>

                              <div>
                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                  {t.name}
                                  {isSelected && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold">
                                      Active
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {t.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center -space-x-1.5 shrink-0">
                              {t.swatches.map((hex, i) => (
                                <span
                                  key={i}
                                  className="w-4 h-4 rounded-full border border-black/60"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Sticker className="w-4 h-4 text-[#4ade80]" />
                        02. Stamp Die-Cut Stickers
                      </span>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((slot) => (
                            <span
                              key={slot}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                slot < stickers.length
                                  ? "bg-[#4ade80] shadow-[0_0_8px_#4ade80]"
                                  : "bg-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          {stickers.length}/3
                        </span>

                        {stickers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setStickers([]);
                              persistCardDesign(theme, []);
                            }}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2.5">
                      {STICKERS.map((s) => {
                        const countOnCard = stickers.filter(
                          (item) => item === s.id
                        ).length;
                        const disabled = stickers.length >= 3;

                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleAddSticker(s.id)}
                            className="group relative p-3 rounded-2xl border border-slate-800 bg-[#121218] hover:border-[#4ade80]/60 hover:bg-[#042f2e]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-90"
                          >
                            {countOnCard > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#4ade80] text-zinc-950 text-[10px] font-extrabold flex items-center justify-center shadow">
                                ×{countOnCard}
                              </span>
                            )}
                            <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
                              {s.id}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 group-hover:text-white truncate w-full text-center">
                              {s.label.split(" ")[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      Hover over the pass to tilt it in 3D. Click any stamped
                      sticker directly on the pass to peel it off.
                    </p>
                  </div>
                </div>

                <div
                  className="lg:col-span-6 p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                >
                  <div
                    className="w-72 h-72 rounded-full blur-[90px] opacity-35 absolute pointer-events-none transition-all duration-700"
                    style={{ background: activeThemeObj.bgStyle }}
                  />

                  <div
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{
                      transform: `perspective(1100px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${
                        tilt.isHovering ? 1.02 : 1
                      })`,
                      transition: tilt.isHovering
                        ? "transform 0.08s ease-out"
                        : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    className="w-full max-w-[360px] rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative overflow-hidden border border-white/25 select-none"
                  >
                    <div
                      className="absolute inset-0 transition-all duration-500"
                      style={{ background: activeThemeObj.bgStyle }}
                    />

                    <div className="absolute inset-x-0 top-0 h-44 opacity-25 mix-blend-overlay pointer-events-none">
                      <img
                        src={event.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                    </div>

                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: tilt.isHovering ? 0.55 : 0.2,
                        background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 65%)`,
                      }}
                    />

                    <div className="relative z-10 p-6">
                      <div className="w-16 h-3 rounded-full bg-[#0c0c10] border border-white/25 mx-auto mb-5 shadow-inner" />

                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-black/35 text-white border border-white/25 backdrop-blur-md">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {event.category} VIP
                        </span>

                        <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-white text-zinc-950 shadow-sm">
                          {formatIndianPrice(event.price)}
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">
                          OFFICIAL ACCESS PASS
                        </p>
                        <h3 className="text-2xl font-extrabold text-white leading-tight mt-1 drop-shadow-sm">
                          {event.title}
                        </h3>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/25 border border-white/15 backdrop-blur-md text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-white/60 block">
                            DATE & TIME
                          </span>
                          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {formatEventDate(event.date)}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-white/60 block">
                            CITY VENUE
                          </span>
                          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{event.city}</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 min-h-[76px] rounded-2xl bg-black/20 border border-dashed border-white/25 px-4 py-3 flex items-center justify-between">
                        {stickers.length === 0 ? (
                          <p className="text-xs text-white/75 italic mx-auto text-center">
                            Tap stickers in the studio to stamp your pass
                          </p>
                        ) : (
                          <div className="flex items-center justify-center gap-4 w-full">
                            {stickers.map((emoji, idx) => {
                              const placement =
                                STICKER_PLACEMENTS[
                                  idx % STICKER_PLACEMENTS.length
                                ];
                              return (
                                <button
                                  key={`${emoji}-${idx}`}
                                  type="button"
                                  onClick={() => handleRemoveSticker(idx)}
                                  title="Click to peel off sticker"
                                  style={{
                                    transform: `rotate(${placement.rotate}) translateY(${placement.translateY})`,
                                  }}
                                  className="group relative w-13 h-13 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.45)] border-2 border-white hover:scale-110 transition-all cursor-pointer"
                                >
                                  <span>{emoji}</span>
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow">
                                    <X className="w-3 h-3" />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between my-1">
                      <div className="w-5 h-5 rounded-full bg-[#0c0c10] -ml-2.5 border-r border-white/25" />
                      <div className="flex-1 border-t-2 border-dashed border-white/30 mx-2" />
                      <div className="w-5 h-5 rounded-full bg-[#0c0c10] -mr-2.5 border-l border-white/25" />
                    </div>

                    <div className="relative z-10 px-6 pb-6 pt-3 bg-black/30 backdrop-blur-md flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/60 block">
                          PASS HOLDER // {activeThemeObj.name.toUpperCase()}
                        </span>
                        <p className="text-sm font-extrabold text-white truncate mt-0.5">
                          {user ? user.name : "VIP COMMUNITY GUEST"}
                        </p>
                        <span className="text-[10px] font-mono text-white/70">
                          ADMIT ONE • #{passSerial}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white text-zinc-950 shrink-0 shadow">
                        <QrCode className="w-8 h-8" />
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