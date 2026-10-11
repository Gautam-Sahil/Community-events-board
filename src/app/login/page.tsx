"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  Mail,
  Briefcase,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import "./auth.css";

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register";
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "user";

  const [isRegisterMode, setIsRegisterMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login State
  const [loginEmail, setLoginEmail] = useState(
    initialRole === "admin" ? "admin@fyerx.com" : ""
  );
  const [loginPassword, setLoginPassword] = useState(
    initialRole === "admin" ? "admin123" : ""
  );
  const [loginRole, setLoginRole] = useState<"user" | "admin">(initialRole);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  function changeView() {
    setIsRegisterMode((prev) => !prev);
    setError("");
  }

  function fillDemoAdmin() {
    setLoginRole("admin");
    setLoginEmail("admin@fyerx.com");
    setLoginPassword("admin123");
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        loginRole === "admin" || loginEmail.toLowerCase() === "admin@fyerx.com"
          ? "/api/admin/login"
          : "/api/auth/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (endpoint === "/api/admin/login") {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin");
      } else {
        localStorage.setItem("token", data.token);
        // Redirect to onboarding/feed if no favourite categories picked yet
        if (!data.user?.favouriteCategories?.length) {
          router.push("/?onboarding=true");
        } else {
          router.push("/feed");
        }
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      // After signup, let user pick their favourite categories (Requirement B7)
      router.push("/?onboarding=true");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-parent">
      <Link
        href="/"
        className="fixed top-5 left-5 z-50 inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className={`auth-container ${isRegisterMode ? "active" : ""}`}>
        {/* LOGIN FORM */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            {error && !isRegisterMode && (
              <div className="auth-error">{error}</div>
            )}

            <div className="input-box">
              <input
                type="email"
                placeholder="Email Address"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <Mail className="icon w-5 h-5" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Lock className="icon w-5 h-5" />
            </div>

            <div className="input-box">
              <select
                value={loginRole}
                onChange={(e) =>
                  setLoginRole(e.target.value as "user" | "admin")
                }
              >
                <option value="user">Visitor / Member</option>
                <option value="admin">Admin Portal</option>
              </select>
              <Briefcase className="icon w-5 h-5" />
            </div>

            <div className="forgot-link">
              <span className="text-slate-500">Quick Demo Access:</span>
              <button type="button" onClick={fillDemoAdmin}>
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                Fill Admin Login
              </button>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>

            <div className="signature">- Gautam</div>
          </form>
        </div>

        {/* REGISTER FORM */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>

            {error && isRegisterMode && (
              <div className="auth-error">{error}</div>
            )}

            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
              <User className="icon w-5 h-5" />
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email Address"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <Mail className="icon w-5 h-5" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <Lock className="icon w-5 h-5" />
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </div>

        {/* SLIDING GREEN TOGGLE PANELS */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don&apos;t have an account to save events & custom cards?</p>
            <button type="button" className="auth-btn" onClick={changeView}>
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button type="button" className="auth-btn" onClick={changeView}>
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