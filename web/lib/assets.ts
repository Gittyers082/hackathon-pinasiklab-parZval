// Prefix for hosting under a sub-path (for example GitHub Pages). Empty at a
// domain root. Set NEXT_PUBLIC_BASE_PATH at build time if you need it.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const asset = (path: string) => `${BASE}${path}`;
