import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";

async function AdminAuthGuard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    redirect("/login?role=admin");
  }

  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== "admin") {
    redirect("/login?role=admin");
  }

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-sm text-slate-400">
          Verifying admin session...
        </div>
      }
    >
      <AdminAuthGuard />
    </Suspense>
  );
}