import type { NextConfig } from "next";
import path from "node:path";

const hosted = process.env.NEXT_PUBLIC_PYPATH_MODE === "hosted";

const nextConfig: NextConfig = {
  // PyPath only ever runs on your own machine (local mode) or fully in the browser (hosted mode).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: { root: path.resolve(__dirname) },
  devIndicators: false,
  // Route handlers live in `route.local.ts`. Only local mode treats `.local.ts` as a page extension,
  // so the hosted build contains no /api routes at all.
  pageExtensions: hosted ? ["tsx", "ts", "jsx", "js"] : ["local.ts", "tsx", "ts", "jsx", "js"],
  ...(hosted ? { output: "export" as const, distDir: "out", images: { unoptimized: true }, trailingSlash: false } : {}),
};

export default nextConfig;
