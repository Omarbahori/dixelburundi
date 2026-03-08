import type { NextConfig } from "next";

const isCpanelBuild = process.env.CPANEL_BUILD === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1,
    serverMinification: false,
    useLightningcss: false,
  },
  typescript: {
    // Shared hosting is too constrained for Next's separate typecheck worker.
    // Keep full typechecking for normal local builds, but skip it on cPanel.
    ignoreBuildErrors: isCpanelBuild,
  },
  images: {
    // cPanel shared hosting can struggle with Next.js on-the-fly image optimization.
    // Serve images directly to reduce CPU/memory pressure and avoid 503 spikes.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async headers() {
    const immutableAssetHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];

    return [
      {
        source: "/uploads/:path*",
        headers: immutableAssetHeaders,
      },
      {
        source: "/images/:path*",
        headers: immutableAssetHeaders,
      },
      {
        source: "/placeholders/:path*",
        headers: immutableAssetHeaders,
      },
      {
        source: "/icon.png",
        headers: immutableAssetHeaders,
      },
      {
        source: "/apple-icon.png",
        headers: immutableAssetHeaders,
      },
      {
        source: "/dixel-192.png",
        headers: immutableAssetHeaders,
      },
      {
        source: "/dixel-512.png",
        headers: immutableAssetHeaders,
      },
    ];
  },
  // Prevent large uploaded media files from being traced into serverless function bundles on Vercel.
  // Media in /public/uploads remains publicly served as static assets.
  outputFileTracingExcludes: {
    "*": ["./public/uploads/**/*"],
  },
};

export default nextConfig;
