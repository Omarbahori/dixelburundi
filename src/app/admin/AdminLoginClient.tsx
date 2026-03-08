"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Toast from "@/components/Toast";
import CTAButton from "@/components/CTAButton";

export default function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const json = (await res
        .json()
        .catch(() => null)) as null | { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setToast({ show: true, msg: json?.error || "Login failed." });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="space-y-2 block">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
            EMAIL
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
            autoComplete="username"
            required
          />
        </label>

        <label className="space-y-2 block">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
            PASSWORD
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
            autoComplete="current-password"
            required
          />
        </label>

        <div className="pt-2">
          <CTAButton className="w-full" variant="primary" type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </CTAButton>
        </div>
      </form>

      <Toast message={toast.msg} show={toast.show} />
    </>
  );
}

