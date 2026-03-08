import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dixel: {
          // Brand palette: red / white / black
          bg: "#22201E",
          accent: "#E22228",
          ink: "#F6F8F5",
          muted: "rgba(255,255,255,0.74)",
          line: "rgba(255,255,255,0.14)",
          panel: "rgba(255,255,255,0.06)",
          panel2: "rgba(255,255,255,0.10)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      letterSpacing: {
        tighter2: "-0.035em",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(226,34,40,0.35), 0 18px 50px rgba(0,0,0,0.35)",
        panel: "0 0 0 1px rgba(255,255,255,0.10), 0 18px 60px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        "dixel-radial":
          "radial-gradient(1100px 600px at 18% 8%, rgba(246,248,245,0.16), transparent 58%), radial-gradient(1200px 800px at 75% 18%, rgba(34,32,30,0.55), transparent 56%), radial-gradient(900px 700px at 60% 65%, rgba(246,248,245,0.10), transparent 55%)",
      },
      keyframes: {
        "soft-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "soft-float": "soft-float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
