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
  Compass,
  ArrowUpRight,
  Sparkles,
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
            <Link href="/" className={pathname === "/" ? "active-link" : ""}>
              Explore Events
            </Link>

            <Link
              href="/feed"
              className={pathname === "/feed" ? "active-link" : ""}
            >
              
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
            <div className="button-bg hidden sm:inline-block">
              <Link href="/login" className="login-btn">
                Login
              </Link>
            </div>
          )}

          
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-11 h-11 rounded-full bg-[#042f2e] border border-[#4ade80]/40 text-[#4ade80] flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.25)] cursor-pointer transition-transform active:scale-90"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[999] md:hidden flex justify-end">
         
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          
          <div className="relative z-10 w-[88%] max-w-sm h-full bg-[#09090b] border-l border-[#4ade80]/25 flex flex-col justify-between p-6 overflow-y-auto shadow-[-20px_0_50px_rgba(0,0,0,0.9)]">
            <div>
              
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                  <span className="logo-gradient text-2xl block">
                    EventPulse
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#4ade80] font-semibold">
                    Navigation Deck
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-[#042f2e] border border-[#4ade80]/50 text-[#4ade80] flex items-center justify-center hover:bg-[#4ade80] hover:text-black transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

             
              {user && (
                <div className="mt-5 p-4 rounded-2xl bg-[#042f2e]/40 border border-[#4ade80]/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#4ade80] font-bold">
                      Signed In Member
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#4ade80]" />
                </div>
              )}

             
              <div className="mt-6 space-y-3">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    pathname === "/"
                      ? "bg-[#042f2e] border-[#4ade80] text-white shadow-[0_0_20px_rgba(74,222,128,0.15)]"
                      : "bg-[#111115] border-white/10 text-slate-200 hover:border-[#4ade80]/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-[#4ade80]">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#4ade80]">
                        01 // DISCOVER
                      </span>
                      <p className="text-base font-bold text-white">
                        Explore Events
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#4ade80]" />
                </Link>

                <Link
                  href="/feed"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    pathname === "/feed"
                      ? "bg-[#042f2e] border-[#4ade80] text-white shadow-[0_0_20px_rgba(74,222,128,0.15)]"
                      : "bg-[#111115] border-white/10 text-slate-200 hover:border-[#4ade80]/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-[#4ade80]">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#4ade80]">
                        02 // PERSONALIZED
                      </span>
                      <p className="text-base font-bold text-white">My Feed</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#4ade80]" />
                </Link>

                {user && (
                  <button
                    type="button"
                    onClick={openModal}
                    className="w-full group flex items-center justify-between p-4 rounded-2xl border bg-[#111115] border-white/10 text-left hover:border-[#4ade80]/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-[#4ade80]">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#4ade80]">
                          03 // PREFERENCES
                        </span>
                        <p className="text-base font-bold text-white">
                          My Interests ({user.favouriteCategories.length})
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#4ade80]" />
                  </button>
                )}

                <Link
                  href={isAdmin ? "/admin" : "/login?role=admin"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-[#042f2e] border-[#4ade80] text-white"
                      : "bg-[#111115] border-white/10 text-slate-200 hover:border-[#4ade80]/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-[#4ade80]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#4ade80]">
                        04 // MANAGEMENT
                      </span>
                      <p className="text-base font-bold text-white">
                        Admin Portal
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#4ade80]" />
                </Link>
              </div>
            </div>

            
            <div className="pt-6 border-t border-white/10 mt-6">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3.5 px-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/25 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user.name})
                </button>
              ) : (
                <div className="button-bg w-full">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="login-btn w-full justify-center py-3.5 text-sm font-bold"
                  >
                    Login / Register Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {showCategoryModal && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111115] rounded-3xl max-w-md w-full p-7 shadow-2xl border border-[#4ade80]/30 text-white">
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