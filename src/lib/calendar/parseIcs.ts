import type { CalendarEvent } from './types';

/** Remove ICS line folding (CRLF + whitespace continuation) */
function unfold(raw: string): string {
  return raw.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Extract value + params for a named property from a pre-split lines array */
function getPropFromLines(
  lines: string[],
  name: string
): { params: string; value: string } | null {
  const upper = name.toUpperCase();
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    const parts = key.split(';');
    if (parts[0].toUpperCase() === upper) {
      return { params: parts.slice(1).join(';'), value };
    }
  }
  return null;
}

/**
 * Map Windows timezone names to IANA timezone identifiers.
 * Exchange/Outlook ICS files use Windows names (e.g. "W. Europe Standard Time").
 */
const WINDOWS_TZ_TO_IANA: Record<string, string> = {
  'W. Europe Standard Time': 'Europe/Berlin',
  'Central Europe Standard Time': 'Europe/Budapest',
  'Romance Standard Time': 'Europe/Paris',
  'GMT Standard Time': 'Europe/London',
  'Eastern Standard Time': 'America/New_York',
  'Central Standard Time': 'America/Chicago',
  'Mountain Standard Time': 'America/Denver',
  'Pacific Standard Time': 'America/Los_Angeles',
  'UTC': 'UTC',
};

/**
 * Convert a naive local datetime string (YYYY-MM-DDTHH:MM:SS) in a given
 * IANA timezone to a UTC Date object.
 */
function localToUtc(isoBase: string, ianaTimezone: string): Date {
  if (ianaTimezone === 'UTC') {
    return new Date(isoBase + 'Z');
  }
  // Treat isoBase as if it were UTC, then compute the real UTC offset for that
  // point in time in ianaTimezone, and subtract it.
  const asIfUtc = new Date(isoBase + 'Z');
  try {
    const tzStr = new Intl.DateTimeFormat('sv-SE', {
      timeZone: ianaTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(asIfUtc);
    // tzStr is like "2025-03-04 10:00:00" — parse it back as UTC to get
    // what the TZ offset was.
    const tzAsUtc = new Date(tzStr.replace(' ', 'T') + 'Z');
    const offsetMs = tzAsUtc.getTime() - asIfUtc.getTime();
    return new Date(asIfUtc.getTime() - offsetMs);
  } catch {
    return asIfUtc;
  }
}

/** Parse an ICS datetime string into a JS Date, respecting TZID */
function parseDateTime(value: string, params: string): { date: Date; isAllDay: boolean } {
  const isAllDay = params.toUpperCase().includes('VALUE=DATE') || !value.includes('T');

  if (isAllDay) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    return { date: new Date(`${y}-${m}-${d}T00:00:00Z`), isAllDay: true };
  }

  const y = value.slice(0, 4);
  const mo = value.slice(4, 6);
  const d = value.slice(6, 8);
  const h = value.slice(9, 11);
  const mi = value.slice(11, 13);
  const s = value.slice(13, 15) || '00';
  const isoBase = `${y}-${mo}-${d}T${h}:${mi}:${s}`;

  // Explicit UTC suffix in value
  if (value.endsWith('Z')) {
    return { date: new Date(isoBase + 'Z'), isAllDay: false };
  }

  // Extract TZID from params (e.g. "TZID=W. Europe Standard Time")
  const tzidMatch = params.match(/TZID=([^;]+)/i);
  const tzid = tzidMatch ? tzidMatch[1].trim() : '';

  if (tzid) {
    const ianaTimezone = WINDOWS_TZ_TO_IANA[tzid] ?? null;
    if (ianaTimezone) {
      return { date: localToUtc(isoBase, ianaTimezone), isAllDay: false };
    }
    // Unknown TZID — try as IANA directly, fall back to local
    try {
      return { date: localToUtc(isoBase, tzid), isAllDay: false };
    } catch {
      // ignore
    }
  }

  return { date: new Date(isoBase), isAllDay: false };
}

/** Get YYYY-MM-DD for a Date in a given IANA timezone, or '' if invalid */
function toDateStr(date: Date, tz: string): string {
  if (isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    try {
      return date.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }
}

/** Decode ICS text escaping */
function decodeIcsText(value: string): string {
  return value
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

/** Parse ICS content line-by-line (memory-efficient, handles large files) */
export function parseIcsForDate(
  icsContent: string,
  targetDate: string,
  tz: string
): CalendarEvent[] {
  const lines = unfold(icsContent).split('\n');
  const events: CalendarEvent[] = [];

  let inEvent = false;
  let eventLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trimEnd();

    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      eventLines = [];
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      inEvent = false;

      // Process collected event lines
      const startProp = getPropFromLines(eventLines, 'DTSTART');
      if (!startProp) {
        eventLines = [];
        continue;
      }

      const { date: startDate, isAllDay } = parseDateTime(startProp.value, startProp.params);

      // Determine the calendar date of this event in the user's timezone
      let eventDate: string;
      if (isAllDay) {
        const v = startProp.value;
        eventDate = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
      } else {
        eventDate = toDateStr(startDate, tz);
      }

      if (eventDate === targetDate) {
        const endProp = getPropFromLines(eventLines, 'DTEND');
        const rawEnd = endProp ? parseDateTime(endProp.value, endProp.params).date : startDate;
        const endDate = isNaN(rawEnd.getTime()) ? startDate : rawEnd;

        const uidProp = getPropFromLines(eventLines, 'UID');
        const summaryProp = getPropFromLines(eventLines, 'SUMMARY');
        const locationProp = getPropFromLines(eventLines, 'LOCATION');

        const location = locationProp?.value ? decodeIcsText(locationProp.value) : undefined;

        events.push({
          id: uidProp?.value ?? `${startProp.value}-${summaryProp?.value ?? ''}`,
          title: summaryProp?.value ? decodeIcsText(summaryProp.value) : '(Kein Titel)',
          isAllDay,
          startTime: startDate,
          endTime: endDate,
          location: location || undefined,
        });
      }

      eventLines = [];
      continue;
    }

    if (inEvent) {
      eventLines.push(trimmed);
    }
  }

  return events.sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.startTime.getTime() - b.startTime.getTime();
  });
}
