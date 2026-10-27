import { promises as fs } from "fs";
import path from "path";

/**
 * Prospect mock-ups (demo-sites/<slug>/), served at houle.ai/demo/<slug>/ and demo.houle.ai/<slug>/
 * (middleware rewrites that host here). Served by this handler rather than from public/: the
 * production server cannot rewrite to public files. Private: always noindex.
 */
const ROOT = path.join(process.cwd(), "demo-sites");
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const segments = (await params).path ?? [];
  const target = path.resolve(ROOT, ...segments);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }
  let file = target;
  try {
    if ((await fs.stat(target)).isDirectory()) file = path.join(target, "index.html");
    const body = await fs.readFile(file);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=300",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow" } });
  }
}
