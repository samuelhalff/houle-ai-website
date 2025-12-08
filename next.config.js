const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const baseConfig = {
  trailingSlash: true,
  // Disable source maps on CI by default. Enable explicitly with BUILD_SOURCEMAPS=true
  productionBrowserSourceMaps: process.env.BUILD_SOURCEMAPS === "true",
  experimental: {
    optimizePackageImports: ["lucide-react", "react-hook-form", "sonner"],
    optimizeCss: true,
    nextScriptWorkers: true,
    // Ensure runtime access to JSON translation files in standalone/serverless outputs
    outputFileTracingIncludes: {
      "/**/*": ["src/translations/**/*"],
    },
    swcPlugins: [
      // Configure SWC to skip polyfills for modern browsers
    ],
    esmExternals: true, // prefer native ESM deps
  },
  output: "standalone",
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1920],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for static assets
  },
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
    reactRemoveProperties: true,
  },
  async redirects() {
    // Redirect non-locale paths to locale-prefixed versions for SEO
    return [
      // Services redirects
      {
        source: "/services",
        destination: "/en/services/",
        permanent: true,
      },
      {
        source: "/services/ai-consulting",
        destination: "/en/services/ai-consulting/",
        permanent: true,
      },
      {
        source: "/services/microsoft-consulting",
        destination: "/en/services/microsoft-consulting/",
        permanent: true,
      },
      // Products redirects
      {
        source: "/products",
        destination: "/en/products/",
        permanent: true,
      },
      {
        source: "/products/word-addin",
        destination: "/en/products/word-addin/",
        permanent: true,
      },
      {
        source: "/products/outlook-addin",
        destination: "/en/products/outlook-addin/",
        permanent: true,
      },
      {
        source: "/products/swiss-gpt",
        destination: "/en/products/swiss-gpt/",
        permanent: true,
      },
      // Resources redirects
      {
        source: "/ressources",
        destination: "/en/ressources/",
        permanent: true,
      },
      {
        source: "/ressources/articles",
        destination: "/en/ressources/articles/",
        permanent: true,
      },
      // Contact redirect
      {
        source: "/contact",
        destination: "/en/contact/",
        permanent: true,
      },
    ];
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
