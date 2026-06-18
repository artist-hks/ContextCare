/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    // Keep heavy native/worker-based libs out of the webpack bundle so they
    // load from node_modules at runtime and resolve their own worker/wasm/lang
    // assets correctly (no CDN round-trips).
    serverComponentsExternalPackages: ["tesseract.js", "sharp"],
  },
};

module.exports = nextConfig;
