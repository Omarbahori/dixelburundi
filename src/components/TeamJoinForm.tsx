"use client";

import { useMemo, useState } from "react";
import CTAButton from "@/components/CTAButton";
import Toast from "@/components/Toast";

function encodeMailto(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export default function TeamJoinForm({ toEmail }: { toEmail: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Designer");
  const [portfolio, setPortfolio] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(false);

  const mailto = useMemo(() => {
    const subject = `Team Application (${role}) - ${name || "New candidate"}`;
    const body = [
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      `Phone: ${phone || "-"}`,
      `Role: ${role || "-"}`,
      `Portfolio/CV link: ${portfolio || "-"}`,
      `Attached file: ${resumeName || "-"}`,
      "",
      "If you selected a file, please attach it in your email before you send.",
      "",
      "About you:",
      message || "-",
    ].join("\n");
    return `mailto:${encodeURIComponent(toEmail)}?subject=${encodeMailto(subject)}&body=${encodeMailto(body)}`;
  }, [toEmail, name, email, phone, role, portfolio, resumeName, message]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 2600);
    try {
      window.open(mailto, "_blank");
    } catch {
      window.location.href = mailto;
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">NAME</div>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
            />
          </label>
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">EMAIL</div>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">PHONE</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+257 ..."
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
            />
          </label>
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">ROLE</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white focus:border-white/24 focus:outline-none"
            >
              <option>Designer</option>
              <option>Photographer</option>
              <option>Videographer</option>
              <option>Social Media Manager</option>
              <option>Digital Marketer</option>
              <option>Web Developer</option>
              <option>Other</option>
            </select>
          </label>
        </div>

        <label className="space-y-2">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">PORTFOLIO LINK</div>
          <input
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="Portfolio link"
            className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
          />
        </label>

        <label className="space-y-2">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">UPLOAD FILE (OPTIONAL)</div>
          <input
            type="file"
            onChange={(e) => setResumeName(e.target.files?.[0]?.name || "")}
            className="block w-full rounded-2xl border border-white/12 bg-white/3 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border file:border-white/24 file:bg-white/8 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/12 focus:border-white/24 focus:outline-none"
          />
          <p className="text-xs text-white/55">Selected: {resumeName || "No file selected"}</p>
        </label>

        <label className="space-y-2">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">MESSAGE</div>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your experience and the role you want."
            className="min-h-[140px] w-full resize-y rounded-2xl border border-white/12 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
          />
        </label>

        <div className="pt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CTAButton type="submit">Apply now</CTAButton>
          <a
            href={mailto}
            className="text-sm font-semibold text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/40"
          >
            Or open email
          </a>
        </div>
      </form>

      <Toast message="Opening your email app..." show={toast} />
    </>
  );
}
