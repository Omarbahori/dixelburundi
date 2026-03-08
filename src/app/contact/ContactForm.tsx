"use client";

import { useMemo, useState } from "react";
import Toast from "@/components/Toast";
import CTAButton from "@/components/CTAButton";

function encodeMailto(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

type Props = {
  toEmail: string;
  packageOptions?: string[];
  initialPackage?: string;
};

export default function ContactForm({
  toEmail,
  packageOptions = [],
  initialPackage = "Not sure yet",
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(initialPackage);
  const [budget, setBudget] = useState("Not sure yet");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(false);

  const mailto = useMemo(() => {
    const subject = `Project inquiry (${company || "New client"})`;
    const body = [
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      `Company: ${company || "-"}`,
      `Package: ${selectedPackage || "-"}`,
      `Budget: ${budget || "-"}`,
      "",
      "Message:",
      message || "-",
    ].join("\n");
    return `mailto:${encodeURIComponent(toEmail)}?subject=${encodeMailto(
      subject,
    )}&body=${encodeMailto(body)}`;
  }, [toEmail, name, email, company, selectedPackage, budget, message]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 2600);

    // Open the user's email app with the message already filled.
    try {
      window.open(mailto, "_blank");
    } catch {
      window.location.href = mailto;
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
              NAME
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
              placeholder="Your name"
              required
            />
          </label>
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
              EMAIL
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
              placeholder="you@company.com"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
              COMPANY (OPTIONAL)
            </div>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
              placeholder="Brand name"
            />
          </label>
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
              PACKAGE
            </div>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white focus:border-white/24 focus:outline-none"
            >
              <option>Not sure yet</option>
              {packageOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
              BUDGET
            </div>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/3 px-4 text-sm text-white focus:border-white/24 focus:outline-none"
            >
              <option>Not sure yet</option>
              <option>300,000 - 750,000 FBU</option>
              <option>750,000 - 1,500,000 FBU</option>
              <option>1,500,000 - 3,000,000 FBU</option>
              <option>3,000,000+ FBU</option>
            </select>
          </label>
        </div>

        <label className="space-y-2">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
            MESSAGE
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[140px] w-full resize-y rounded-2xl border border-white/12 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/24 focus:outline-none"
            placeholder="Tell us what you need and what you want to achieve."
            required
          />
        </label>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <CTAButton className="w-full sm:w-auto" type="submit">
            Send message
          </CTAButton>
          <a
            href={mailto}
            className="text-sm font-semibold text-white/80 underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-white/45"
          >
            Or open email
          </a>
        </div>
      </form>

      <Toast message="Opening your email app..." show={toast} />
    </>
  );
}

