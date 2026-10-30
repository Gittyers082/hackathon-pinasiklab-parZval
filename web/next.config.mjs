import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A static export: no Node server to run, hostable anywhere, and every page
  // is plain HTML that paints before any JavaScript arrives. That matters on
  // a low-end Android on a weak connection.
  output: 'export',
  trailingSlash: true,           // /login/ -> login/index.html on any static host
  images: { unoptimized: true }, // photos are pre-sized in public/assets
  reactStrictMode: true,

  // Pin the project root. Without this, a package-lock.json higher up the
  // disk (outside this repo) is picked up and the build warns about it.
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
};

export default nextConfig;
