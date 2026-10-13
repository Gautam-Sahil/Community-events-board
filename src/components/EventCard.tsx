"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Bell,
  BellRing,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { formatIndianPrice, formatEventDate } from "@/lib/format";
import { fetchJson } from "@/lib/fetchJson";

export interface EventItem {
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

interface EventCardProps {
  event: EventItem;
  initialReminded: boolean;
  isLoggedIn: boolean;
  onReminderChange?: (eventId: string, newStatus: boolean) => void;
}

export default function EventCard({
  event,
  initialReminded,
  isLoggedIn,
  onReminderChange,
}: EventCardProps) {
  const [optimisticReminded, setOptimisticReminded] = useState<boolean | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState("");

  const reminded =
    optimisticReminded !== null ? optimisticReminded : initialReminded;

  async function handleRemindClick() {
    setErrorMsg("");

    const previousState = reminded;
    const nextState = !previousState;
    setOptimisticReminded(nextState);
    onReminderChange?.(event._id, nextState);

    try {
      const token = localStorage.getItem("token");
      const { ok, status, data } = await fetchJson<{ error?: string }>(
        "/api/user/reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: JSON.stringify({ eventId: event._id }),
        }
      );

      if (!ok || status === 401) {
        throw new Error(
          status === 401
            ? "Please log in to save event reminders"
            : data.error || "Failed to save reminder"
        );
      }
      setOptimisticReminded(null);
    } catch (err: unknown) {
      setOptimisticReminded(previousState);
      onReminderChange?.(event._id, previousState);
      const message =
        err instanceof Error ? err.message : "Could not save reminder";
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  }

  const eventUrl = "/events/" + event._id;

  return (
    <div className="event-dark-card flex flex-col justify-between">
      <div>
        <div className="relative h-52 bg-zinc-900 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover brightness-90 hover:scale-105 hover:brightness-100 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/30 pointer-events-none" />

          <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold bg-[#042f2e]/90 text-[#4ade80] border border-[#4ade80]/30 backdrop-blur-md">
            {event.category}
          </span>
          <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold bg-black/80 text-white border border-white/15 backdrop-blur-md">
            {formatIndianPrice(event.price)}
          </span>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2.5">
            <span className="inline-flex items-center gap-1 font-semibold text-[#4ade80]">
              <Calendar className="w-3.5 h-3.5" />
              {formatEventDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {event.city}
            </span>
          </div>

          <Link href={eventUrl}>
            <h3 className="text-lg font-bold text-white hover:text-[#4ade80] transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleRemindClick}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              reminded
                ? "bg-[#4ade80] text-zinc-950 shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                : "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {reminded ? (
              <>
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
                Reminder Set
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                Remind Me
              </>
            )}
          </button>

          <Link
            href={eventUrl}
            className="py-2.5 px-4 rounded-full text-xs font-semibold bg-[#042f2e] hover:bg-[#115e59] text-[#4ade80] border border-[#4ade80]/30 transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Design Card
          </Link>
        </div>
      </div>
    </div>
  );
}