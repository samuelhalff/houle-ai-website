import { NextResponse } from "next/server";

const BASE = "https://houle.ai";
const paths = ["/en/", "/en/contact"];

export async function GET() {
  const defaultLastmod = new Date().toISOString().slice(0, 10);

  const urlEntries = paths.map((path) => {
    return `  <url>
    <loc>${BASE}${path}</loc>
    <lastmod>${defaultLastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${path === "/en/" ? "1.0" : "0.6"}</priority>
  </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
