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
      const res = await fetch("/api/user/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer \${token}` } : {}),
        },
        body: JSON.stringify({ eventId: event._id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error ||
            (isLoggedIn
              ? "Failed to save reminder"
              : "Please log in to save event reminders")
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-emerald-800 shadow-xs">
            {event.category}
          </span>
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/85 text-white backdrop-blur-xs">
            {formatIndianPrice(event.price)}
          </span>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <Calendar className="w-3.5 h-3.5" />
              {formatEventDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {event.city}
            </span>
          </div>

          <Link href={`/events/\${event._id}`}>
            <h3 className="text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">
            {event.description}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-3 border-t border-slate-300">
          <button
            type="button"
            onClick={handleRemindClick}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer \${
              reminded
                ? "bg-emerald-600 text-black shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
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
            href={`/events/\${event._id}`}
            className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Design Card
          </Link>
        </div>
      </div>
    </div>
  );
}