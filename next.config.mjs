const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

// Next.js streams page data through inline scripts, so a strict CSP needs
// 'unsafe-inline'. Applied in production only: Turbopack dev relies on eval for HMR.
const prodOnlyHeaders = process.env.NODE_ENV === "production" ? [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
] : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["argon2"],
  async headers() {
    return [{ source: "/:path*", headers: [...securityHeaders, ...prodOnlyHeaders] }];
  },
};
export default nextConfig;
