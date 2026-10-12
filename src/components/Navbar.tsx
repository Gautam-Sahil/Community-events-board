"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
  ShieldCheck,
  LogOut,
  Check,
  Loader2,
  SlidersHorizontal,
  Menu,
  X,
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
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
          ...(token ? { Authorization: "Bearer " + token } : {}),
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
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="cinion-navbar">
        <Link href="/" className="logo-gradient">
          EventPulse
        </Link>

   
        <div className="rainbow hidden md:block">
          <div className="cinion-nav-inner">
            <Link
              href="/"
              className={pathname === "/" ? "active-link" : ""}
            >
              Explore Events
            </Link>

            <Link
              href="/feed"
              className={pathname === "/feed" ? "active-link" : ""}
            >
              <Heart className="w-4 h-4 text-[#4ade80]" />
              My Feed
            </Link>

            {user && (
              <button type="button" onClick={openModal}>
                <SlidersHorizontal className="w-4 h-4 text-[#4ade80]" />
                Interests ({user.favouriteCategories.length})
              </button>
            )}

            <Link
              href={isAdmin ? "/admin" : "/login?role=admin"}
              className={pathname.startsWith("/admin") ? "active-link" : ""}
            >
              <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
              Admin
            </Link>
          </div>
        </div>

        
        <div className="cinion-right">
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3.5 py-2 rounded-full">
                Hi, <span className="text-[#4ade80]">{user.name}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="button-bg">
              <Link href="/login" className="login-btn">
                Login
              </Link>
            </div>
          )}

         
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-white p-1.5 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </nav>

    
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center gap-6 p-6 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-white p-2 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold text-white hover:text-[#4ade80]"
          >
            Explore Events
          </Link>

          <Link
            href="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold text-white hover:text-[#4ade80] flex items-center gap-2"
          >
            <Heart className="w-6 h-6 text-[#4ade80]" />
            My Feed
          </Link>

          {user && (
            <button
              type="button"
              onClick={openModal}
              className="text-2xl font-bold text-white hover:text-[#4ade80] flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-6 h-6 text-[#4ade80]" />
              Interests ({user.favouriteCategories.length})
            </button>
          )}

          <Link
            href={isAdmin ? "/admin" : "/login?role=admin"}
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold text-white hover:text-[#4ade80] flex items-center gap-2"
          >
            <ShieldCheck className="w-6 h-6 text-[#4ade80]" />
            Admin Portal
          </Link>

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 px-6 py-2.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-semibold text-base"
            >
              Logout ({user.name})
            </button>
          )}
        </div>
      )}

      
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111115] rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-800 text-white">
            <h2 className="text-xl font-bold text-white">
              Pick Your Favourite Categories
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select the event vibes you love. Your{" "}
              <span className="font-semibold text-[#4ade80]">My Feed</span>{" "}
              page will curate upcoming events from these categories.
            </p>

            <div className="grid grid-cols-2 gap-3 my-6">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategorySelection(cat)}
                    className={`p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#4ade80] bg-[#042f2e] text-[#4ade80]"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#4ade80]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <div className="button-bg">
                <button
                  type="button"
                  disabled={savingFavs}
                  onClick={handleSaveCategories}
                  className="login-btn disabled:opacity-60"
                >
                  {savingFavs && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}