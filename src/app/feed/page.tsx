"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Heart, Loader2, Sparkles, CalendarHeart } from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard, { EventItem } from "@/components/EventCard";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  favouriteCategories: string[];
  reminders: string[];
}

function MyFeedContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      setError("");
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setUser(meData.user);
        setIsAdmin(meData.isAdmin);

        if (!meData.user) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const feedRes = await fetch("/api/feed", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const feedData = await feedRes.json();
        if (!feedRes.ok) {
          throw new Error(feedData.error || "Failed to load feed");
        }
        setEvents(feedData.events || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading feed");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  // Re-fetch feed when user updates their favourite categories from the Navbar modal
  async function handleUserUpdated(updatedUser: UserProfile | null) {
    setUser(updatedUser);
    if (!updatedUser) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/feed", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReminderSync(eventId: string, isReminded: boolean) {
    if (!user) return;
    const nextReminders = isReminded
      ? [...user.reminders, eventId]
      : user.reminders.filter((id) => id !== eventId);
    setUser({ ...user, reminders: nextReminders });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} isAdmin={isAdmin} onUserUpdate={handleUserUpdated} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4 fill-rose-500" />
              Personalized For You
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Feed</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Upcoming active events matching your favourite categories.
            </p>
          </div>

          {user && user.favouriteCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {user.favouriteCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium">Curating your personal feed...</p>
          </div>
        ) : !user ? (
          <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center p-6">
            <CalendarHeart className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">
              Sign in to view your personalized feed
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Create an account or log in to pick your favourite categories and
              save event reminders.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
            >
              Login / Register
            </Link>
          </div>
        ) : user.favouriteCategories.length === 0 ? (
          <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center p-6">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">
              No favourite categories selected yet
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Click the{" "}
              <span className="font-semibold text-emerald-700">Interests</span>{" "}
              button in the top navigation bar to pick categories like Music,
              Food, or Workshop!
            </p>
          </div>
        ) : error ? (
          <div className="py-16 bg-red-50 border border-red-200 rounded-2xl text-center p-6 text-red-700">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center p-6">
            <h2 className="text-base font-bold text-slate-800">
              No upcoming events in your favourite categories right now
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Try adding more categories using the Interests button above or
              explore all events.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              Explore All Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <EventCard
                key={ev._id}
                event={ev}
                isLoggedIn={true}
                initialReminded={user.reminders.includes(ev._id)}
                onReminderChange={handleReminderSync}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyFeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
          Loading feed...
        </div>
      }
    >
      <MyFeedContent />
    </Suspense>
  );
}