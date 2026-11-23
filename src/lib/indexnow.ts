import config from "@/src/data/indexnow.json";

/**
 * IndexNow for houle.ai: one POST to api.indexnow.org, which shares the URLs
 * with every participating engine (Bing, Yandex, Seznam, Naver…). The key file
 * is public/<key>.txt (key and location in src/data/indexnow.json, shared with
 * scripts/indexnow-changed.js). Only houle.ai URLs are sent. Any status other
 * than 200 or 202 counts as a failure.
 */
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  const urlList = [...new Set(urls)].filter((u) => u.startsWith(`https://${config.host}/`)).slice(0, 10000);
  if (!urlList.length) return false;
  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: config.host, key: config.key, keyLocation: config.keyLocation, urlList }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] ${urlList.length} URL(s) accepted (${response.status})`);
      return true;
    }
    console.warn(`[IndexNow] refused with status ${response.status}`);
    return false;
  } catch (error) {
    console.warn("[IndexNow] request failed:", error);
    return false;
  }
}
