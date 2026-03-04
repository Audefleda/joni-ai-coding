const TODOIST_API_KEY = 'todoist_api_key';

export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TODOIST_API_KEY);
}

export function setApiKey(key: string): void {
  localStorage.setItem(TODOIST_API_KEY, key.trim());
}

export function removeApiKey(): void {
  localStorage.removeItem(TODOIST_API_KEY);
}

const ICS_URL_KEY = 'calendar_ics_url';

export function getIcsUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ICS_URL_KEY);
}

export function setIcsUrl(url: string): void {
  localStorage.setItem(ICS_URL_KEY, url.trim());
}

export function removeIcsUrl(): void {
  localStorage.removeItem(ICS_URL_KEY);
}
