import { NextRequest, NextResponse } from 'next/server';
import { locales } from '@/src/lib/i18n';
import { submitToIndexNow } from '@/src/lib/indexnow';

export async function POST(req: NextRequest) {
  // Auth: check for secret header matching INDEXNOW_SECRET env variable
  const provided = req.headers.get('x-indexnow-secret');
  const expected = process.env.INDEXNOW_SECRET || '';
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = 'https://houle.ai';
  const paths = ['/', '/contact'];
  const urls = locales.flatMap((loc) => paths.map((p) => `${base}/${loc}${p === '/' ? '' : p}`));

  try {
    await submitToIndexNow(urls);
    return NextResponse.json({ ok: true, count: urls.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Search indexing error' }, { status: 500 });
  }
}
