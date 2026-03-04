'use client';

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import type { CalendarEvent, CalendarErrorKind } from '@/lib/calendar/types';

interface SerializedEvent {
  id: string;
  title: string;
  isAllDay: boolean;
  startTime: string;
  endTime: string;
  location?: string;
}

/** Strip known prefixes (e.g. "SyncBlocker: ") from event titles for display */
function cleanTitle(title: string): string {
  return title.replace(/^SyncBlocker:\s*/i, '');
}

function deserialize(e: SerializedEvent): CalendarEvent {
  return {
    ...e,
    title: cleanTitle(e.title),
    startTime: new Date(e.startTime),
    endTime: new Date(e.endTime),
  };
}

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Europe/Berlin';
  }
}

// --- Reducer ---

interface State {
  events: CalendarEvent[];
  isLoading: boolean;
  errorKind: CalendarErrorKind | null;
  fetchId: number;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; events: CalendarEvent[] }
  | { type: 'FETCH_ERROR'; errorKind: CalendarErrorKind }
  | { type: 'REFRESH' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, errorKind: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, events: action.events, errorKind: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, errorKind: action.errorKind };
    case 'REFRESH':
      return { ...state, fetchId: state.fetchId + 1 };
    default:
      return state;
  }
}

const EMPTY: CalendarEvent[] = [];

export interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  allDayEvents: CalendarEvent[];
  timedEvents: CalendarEvent[];
  isLoading: boolean;
  errorKind: CalendarErrorKind | null;
  refresh: () => void;
}

export function useCalendarEvents(icsUrl: string | null): UseCalendarEventsReturn {
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    isLoading: false,
    errorKind: null,
    fetchId: 0,
  });

  const refresh = useCallback(() => dispatch({ type: 'REFRESH' }), []);

  useEffect(() => {
    if (!icsUrl) return;

    let cancelled = false;
    dispatch({ type: 'FETCH_START' });

    const params = new URLSearchParams({
      url: icsUrl,
      date: getTodayStr(),
      tz: getUserTimezone(),
    });

    fetch(`/api/calendar?${params.toString()}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const kind = (body?.error as CalendarErrorKind) ?? 'unknown';
          dispatch({ type: 'FETCH_ERROR', errorKind: kind });
          return;
        }
        const data = await res.json();
        const events: CalendarEvent[] = (data.events as SerializedEvent[]).map(deserialize);
        dispatch({ type: 'FETCH_SUCCESS', events });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'FETCH_ERROR', errorKind: 'network' });
      });

    return () => { cancelled = true; };
  }, [icsUrl, state.fetchId]);

  const effectiveEvents = icsUrl ? state.events : EMPTY;
  const allDayEvents = useMemo(() => effectiveEvents.filter((e) => e.isAllDay), [effectiveEvents]);
  const timedEvents = useMemo(() => effectiveEvents.filter((e) => !e.isAllDay), [effectiveEvents]);

  return {
    events: effectiveEvents,
    allDayEvents,
    timedEvents,
    isLoading: icsUrl ? state.isLoading : false,
    errorKind: icsUrl ? state.errorKind : null,
    refresh,
  };
}
