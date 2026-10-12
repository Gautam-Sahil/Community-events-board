"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Heart,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Check,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

const ALL_CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  favouriteCategories: string[];
  reminders: string[];
}

interface NavbarProps {
  user: UserProfile | null;
  isAdmin: boolean;
  onUserUpdate?: (updatedUser: UserProfile | null) => void;
}

export default function Navbar({ user, isAdmin, onUserUpdate }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [draftCategories, setDraftCategories] = useState<string[] | null>(null);
  const [savingFavs, setSavingFavs] = useState(false);

  const isOnboarding = Boolean(
    user && searchParams.get("onboarding") === "true" && !onboardingDismissed
  );
  const showCategoryModal = modalOpen || isOnboarding;

  const selectedCategories =
    draftCategories ?? user?.favouriteCategories ?? [];

  function openModal() {
    setDraftCategories(user?.favouriteCategories ?? []);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setOnboardingDismissed(true);
    setDraftCategories(null);
  }

  function toggleCategorySelection(cat: string) {
    const current = draftCategories ?? user?.favouriteCategories ?? [];
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setDraftCategories(next);
  }

  async function handleSaveCategories() {
    setSavingFavs(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/favourites", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ favouriteCategories: selectedCategories }),
      });

      const data = await res.json();
      if (res.ok && user) {
        const updated = {
          ...user,
          favouriteCategories: data.favouriteCategories,
        };
        onUserUpdate?.(updated);
        closeModal();
        if (searchParams.get("onboarding") === "true") {
          router.push("/feed");
        }
      }
    } finally {
      setSavingFavs(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    onUserUpdate?.(null);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base tracking-tight block leading-none">
                  CommunityEvents
                </span>
                <span className="text-[11px] text-slate-500">
                  Local Discovery Board
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Explore Events
              </Link>
              <Link
                href="/feed"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  pathname === "/feed"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500" />
                My Feed
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/feed"
              className="md:hidden px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 inline-flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5" />
              Feed
            </Link>

            {user ? (
              <>
                <button
                  type="button"
                  onClick={openModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Interests</span>
                  <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px]">
                    {user.favouriteCategories.length}
                  </span>
                </button>

                <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  {user.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                Login / Register
              </Link>
            )}

            <Link
              href={isAdmin ? "/admin" : "/login?role=admin"}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Pick Your Favourite Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select the event types you love. Your{" "}
              <span className="font-semibold text-emerald-700">My Feed</span>{" "}
              page will show upcoming events from these categories.
            </p>

            <div className="grid grid-cols-2 gap-2.5 my-5">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategorySelection(cat)}
                    className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingFavs}
                onClick={handleSaveCategories}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {savingFavs && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}