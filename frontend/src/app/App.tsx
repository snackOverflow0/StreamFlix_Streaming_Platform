import { lazy, Suspense } from "react";
import StreamFlixApp from "@/features/streamflix/StreamFlixApp";

const AdminApp = lazy(() => import("@/features/admin/AdminApp"));

export default function App() {
  const pathname = window.location.pathname;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#070b1a] text-white grid place-items-center">
            <p className="text-slate-300">Loading administration…</p>
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  return <StreamFlixApp />;
}
