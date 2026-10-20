import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (built on pdfjs-dist) locates its pdf.worker file relative
  // to its own package at runtime. Bundling it breaks that lookup
  // ("Setting up fake worker failed: Cannot find module pdf.worker.mjs"),
  // so load it from node_modules on the server instead.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
