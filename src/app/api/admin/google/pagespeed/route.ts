import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getGoogleCredentials } from '@/lib/google-credentials';

// Runs a live PageSpeed Insights check for a given URL. Uses a plain API key — no OAuth/user
// connection needed, this is a public Google API.
export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { pagespeedApiKey: apiKey } = await getGoogleCredentials();
  if (!apiKey) {
    return NextResponse.json({ error: 'PageSpeed API key is not configured yet — add it on the Google Integrations admin page.' }, { status: 400 });
  }

  const { url, strategy } = await req.json();
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ url, key: apiKey, strategy: strategy === 'DESKTOP' ? 'DESKTOP' : 'MOBILE' });
    ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'].forEach((c) => params.append('category', c));

    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`PageSpeed API error (${res.status}): ${body}`);
    }

    const data = await res.json();
    const categories = data.lighthouseResult?.categories || {};
    const scores = {
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    };

    return NextResponse.json({ scores });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'PageSpeed test failed' }, { status: 500 });
  }
}
