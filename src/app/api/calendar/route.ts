import { NextRequest, NextResponse } from 'next/server';
import { parseIcsForDate } from '@/lib/calendar/parseIcs';

// Allowlist of hostnames the server is permitted to fetch ICS data from.
// This prevents SSRF attacks (e.g. probing internal networks or cloud metadata).
const ALLOWED_HOSTNAMES = new Set([
  'outlook.live.com',
  'outlook.office.com',
  'outlook.office365.com',
]);

const MAX_ICS_BYTES = 5 * 1024 * 1024; // 5 MB

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const date = request.nextUrl.searchParams.get('date'); // YYYY-MM-DD
  const tz = request.nextUrl.searchParams.get('tz') ?? 'Europe/Berlin';

  if (!url || !date) {
    return NextResponse.json({ error: 'url and date parameters required' }, { status: 400 });
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:') {
      throw new Error('only https allowed');
    }
  } catch {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  // SSRF protection: only allow known Office 365 / Outlook calendar hostnames
  if (!ALLOWED_HOSTNAMES.has(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'url_not_allowed' }, { status: 403 });
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: { Accept: 'text/calendar, */*' },
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'fetch_error' }, { status: 502 });
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > MAX_ICS_BYTES) {
      return NextResponse.json({ error: 'response_too_large' }, { status: 502 });
    }
    const icsContent = await response.text();
    if (Buffer.byteLength(icsContent, 'utf8') > MAX_ICS_BYTES) {
      return NextResponse.json({ error: 'response_too_large' }, { status: 502 });
    }
    const events = parseIcsForDate(icsContent, date, tz);

    // Serialize Dates to ISO strings for JSON transport
    const serialized = events.map((e) => ({
      ...e,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
    }));

    return NextResponse.json({ events: serialized });
  } catch (err) {
    console.error('[/api/calendar]', err);
    const isTimeout =
      (err instanceof Error && err.message.toLowerCase().includes('timeout')) ||
      (err instanceof DOMException && err.name === 'TimeoutError');
    if (isTimeout) {
      return NextResponse.json({ error: 'network' }, { status: 502 });
    }
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
}
