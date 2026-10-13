"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { fetchJson } from "@/lib/fetchJson";
import "./auth.css";

function AuthFormContent() {
  const searchParams = useSearchParams();

  const [registerOverride, setRegisterOverride] = useState<boolean | null>(
    null
  );
  const [roleOverride, setRoleOverride] = useState<"user" | "admin" | null>(
    null
  );
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [passwordOverride, setPasswordOverride] = useState<string | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const isRegisterMode =
    registerOverride ?? searchParams.get("mode") === "register";
  const loginRole =
    roleOverride ?? (searchParams.get("role") === "admin" ? "admin" : "user");
  const loginEmail =
    emailOverride ?? (loginRole === "admin" ? "sahil@admin.com" : "");
  const loginPassword =
    passwordOverride ?? (loginRole === "admin" ? "admin123" : "");

  function changeView() {
    setIsAnimating(true);
    setRegisterOverride(!isRegisterMode);
    setError("");
    setLoading(false);
    setTimeout(() => setIsAnimating(false), 900);
  }

  function handleSelectRole(role: "user" | "admin") {
    setRoleOverride(role);
    setError("");
    setLoading(false);
    if (role === "admin") {
      setEmailOverride("sahil@admin.com");
      setPasswordOverride("admin123");
    } else {
      if (loginEmail.toLowerCase() === "sahil@admin.com") {
        setEmailOverride("");
        setPasswordOverride("");
      }
    }
  }

  function fillDemoAdmin() {
    setRoleOverride("admin");
    setEmailOverride("sahil@admin.com");
    setPasswordOverride("admin123");
    setError("");
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const endpoint =
        loginRole === "admin" ? "/api/admin/login" : "/api/auth/login";

      const { ok, data } = await fetchJson<{
        token?: string;
        error?: string;
        user?: { favouriteCategories?: string[] };
      }>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      if (loginRole === "admin") {
        localStorage.removeItem("token");
        if (data.token) {
          localStorage.setItem("admin_token", data.token);
        }
        setLoading(false);
        window.location.href = "/admin";
      } else {
        localStorage.removeItem("admin_token");
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setLoading(false);
        if (!data.user?.favouriteCategories?.length) {
          window.location.href = "/?onboarding=true";
        } else {
          window.location.href = "/feed";
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Connection error. Please try again."
      );
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const { ok, data } = await fetchJson<{
        token?: string;
        error?: string;
      }>("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      if (!ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      localStorage.removeItem("admin_token");
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setLoading(false);
      window.location.href = "/?onboarding=true";
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Connection error. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="auth-parent" suppressHydrationWarning>
      <div
        suppressHydrationWarning
        className={`auth-container ${isRegisterMode ? "active" : ""} ${
          isAnimating ? "animating" : ""
        }`}
      >
        <div className="form-box login">
          <form onSubmit={handleLogin} suppressHydrationWarning>
            <Link href="/" className="back-inline-link">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to EventPulse
            </Link>

            <h1>Welcome Back</h1>
            <p className="text-slate-500 !mt-1 !mb-3">
              Sign in to access your events & saved passes
            </p>

            <div className="role-switcher">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => handleSelectRole("user")}
                className={`role-pill ${loginRole === "user" ? "active" : ""}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Visitor Member
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => handleSelectRole("admin")}
                className={`role-pill ${loginRole === "admin" ? "active" : ""}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Admin Portal
              </button>
            </div>

            {error && !isRegisterMode && (
              <div className="auth-error">{error}</div>
            )}

            <div className="input-box">
              <Mail className="field-icon w-4 h-4" />
              <input
                type="email"
                placeholder="Email Address"
                required
                suppressHydrationWarning
                value={loginEmail}
                onChange={(e) => setEmailOverride(e.target.value)}
              />
            </div>

            <div className="input-box">
              <Lock className="field-icon w-4 h-4" />
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                required
                suppressHydrationWarning
                value={loginPassword}
                onChange={(e) => setPasswordOverride(e.target.value)}
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowLoginPassword((prev) => !prev)}
                className="eye-btn"
                aria-label={
                  showLoginPassword ? "Hide password" : "Show password"
                }
                title={showLoginPassword ? "Hide password" : "Show password"}
              >
                {showLoginPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="forgot-link">
              <span className="text-slate-400">Testing the assignment?</span>
              <button
                type="button"
                suppressHydrationWarning
                onClick={fillDemoAdmin}
              >
                <ShieldCheck className="w-3 h-3 inline mr-1" />
                Auto-Fill Admin
              </button>
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              disabled={loading}
              className="auth-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span suppressHydrationWarning>Signing in...</span>
                </>
              ) : (
                <span suppressHydrationWarning>
                  {loginRole === "admin" ? "Sign In as Admin" : "Sign In"}
                </span>
              )}
            </button>

            <div className="signature">- Gautam</div>
          </form>
        </div>

        <div className="form-box register">
          <form onSubmit={handleRegister} suppressHydrationWarning>
            <Link href="/" className="back-inline-link">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to EventPulse
            </Link>

            <h1>Create Account</h1>
            <p className="text-slate-500 !mt-1 !mb-4">
              Join to customize event passes & set reminders
            </p>

            {error && isRegisterMode && (
              <div className="auth-error">{error}</div>
            )}

            <div className="input-box">
              <User className="field-icon w-4 h-4" />
              <input
                type="text"
                placeholder="Full Name"
                required
                suppressHydrationWarning
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>

            <div className="input-box">
              <Mail className="field-icon w-4 h-4" />
              <input
                type="email"
                placeholder="Email Address"
                required
                suppressHydrationWarning
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <div className="input-box">
              <Lock className="field-icon w-4 h-4" />
              <input
                type={showRegPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                required
                minLength={6}
                suppressHydrationWarning
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowRegPassword((prev) => !prev)}
                className="eye-btn"
                aria-label={showRegPassword ? "Hide password" : "Show password"}
                title={showRegPassword ? "Hide password" : "Show password"}
              >
                {showRegPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              disabled={loading}
              className="auth-btn mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Free Account</span>
              )}
            </button>
          </form>
        </div>

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>
              New to EventPulse? Create an account to curate your personal event
              feed and design collectible passes.
            </p>
            <button
              type="button"
              suppressHydrationWarning
              className="auth-btn"
              onClick={changeView}
            >
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>
              Already have an EventPulse account? Sign in to view your saved
              reminders and custom cards.
            </p>
            <button
              type="button"
              suppressHydrationWarning
              className="auth-btn"
              onClick={changeView}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-parent">Loading...</div>}>
      <AuthFormContent />
    </Suspense>
  );
}