const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const baseConfig = {
  trailingSlash: true,
  // Let middleware own URL canonicalization so slashless requests do not hit
  // a framework-level redirect before locale normalization/noindex headers apply.
  skipTrailingSlashRedirect: true,
  // Disable source maps on CI by default. Enable explicitly with BUILD_SOURCEMAPS=true
  productionBrowserSourceMaps: process.env.BUILD_SOURCEMAPS === "true",
  experimental: {
    optimizePackageImports: ["lucide-react", "react-hook-form", "sonner"],
    optimizeCss: true,
  },
  // Ensure runtime access to JSON translation files in standalone/serverless outputs
  outputFileTracingIncludes: {
    "/**/*": ["src/translations/**/*"],
  },
  output: "standalone",
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1920],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for static assets
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
    reactRemoveProperties: true,
  },
  async redirects() {
    // Locale prefixing + trailing-slash normalization is handled in middleware.
    // Keeping redirects empty here avoids conflicts and redirect chains.
    return [];
  },
  async rewrites() {
    // No rewrites needed for houle.ai - all routes use their canonical paths
    return [];
  },
  async headers() {
    return [
      // Cache Next.js static files aggressively
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache public assets (images, svgs, css, js) with long TTL
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Favicons and icons
      {
        source:
          "/:icon(favicon\\.ico|favicon\\.png|favicon\\.svg|apple-touch-icon\\.png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Self-hosted fonts in /public/fonts
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Web manifests change rarely but validate on each request
      {
        source: "/:manifest(site\\.webmanifest|manifest\\.webmanifest)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      // Robots and sitemaps (revalidate each request)
      {
        source: "/:file(robots\\.txt|sitemap\\.xml|sitemap_index\\.xml)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(baseConfig);
