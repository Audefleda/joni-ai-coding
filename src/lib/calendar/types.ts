export interface CalendarEvent {
  id: string;
  title: string;
  isAllDay: boolean;
  startTime: Date;
  endTime: Date;
  location?: string;
}

export type CalendarErrorKind = 'invalid_url' | 'fetch_error' | 'network' | 'unknown';
