import {
  TodoistTask,
  TodoistProject,
  UnauthorizedError,
  NetworkError,
  ServiceUnavailableError,
} from './types';

const BASE_URL = 'https://api.todoist.com/api/v1';

interface PaginatedResponse<T> {
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
}

async function todoistFetch<T>(
  endpoint: string,
  apiKey: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
  if (response.status >= 500) throw new ServiceUnavailableError();
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  return response.json() as Promise<T>;
}

async function todoistFetchList<T>(endpoint: string, apiKey: string): Promise<T[]> {
  const results: T[] = [];
  const sep = endpoint.includes('?') ? '&' : '?';
  let cursor: string | null = null;

  do {
    const url: string = cursor ? `${endpoint}${sep}cursor=${encodeURIComponent(cursor)}` : endpoint;
    const data = await todoistFetch<PaginatedResponse<T>>(url, apiKey);
    results.push(...data.results);
    cursor = data.next_cursor;
  } while (cursor);

  return results;
}

export async function validateApiKey(apiKey: string): Promise<void> {
  await todoistFetchList<TodoistProject>('/projects', apiKey);
}

export async function getTodayTasks(apiKey: string): Promise<TodoistTask[]> {
  return todoistFetchList<TodoistTask>('/tasks/filter?query=today', apiKey);
}

export async function getProjects(apiKey: string): Promise<TodoistProject[]> {
  return todoistFetchList<TodoistProject>('/projects', apiKey);
}
