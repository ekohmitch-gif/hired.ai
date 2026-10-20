import type { NextConfig } from "next";

// No serverExternalPackages: the parse route's PDF engine (unpdf) is a
// serverless build with no external worker file, so nothing needs to be
// excluded from bundling. (pdf-parse/pdfjs-dist previously needed the
// exemption — and its worker file still failed to load in production.)
const nextConfig: NextConfig = {};

export default nextConfig;
