# Technical Architecture — MyDayPlaner

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4
**Prinzip:** Kein eigener Backend-Server. Alle API-Calls laufen direkt im Browser (außer Notion — siehe unten).

---

## 1. Verzeichnisstruktur

```
src/
├── app/
│   ├── layout.tsx              # Root Layout (HTML, global CSS)
│   ├── page.tsx                # Entry: redirect → /setup oder /today
│   ├── setup/
│   │   └── page.tsx            # MDP-1: API-Key Konfiguration
│   ├── today/
│   │   └── page.tsx            # MDP-2/3: Heutige Todos
│   └── api/
│       └── notion/
│           └── route.ts        # MDP-5: Server-Proxy für Notion (CORS-Workaround)
│
├── components/
│   ├── setup/
│   │   └── ApiKeyForm.tsx      # MDP-1: Eingabe, Validierung, Speichern
│   └── todos/
│       ├── TodoList.tsx        # MDP-2: Container mit Lade-/Leer-/Fehlerzustand
│       ├── TodoItem.tsx        # MDP-2/3: Einzelne Aufgabe + "Erledigt"-Checkbox
│       └── TodoSkeleton.tsx    # MDP-2: Skeleton-Loader
│
├── hooks/
│   ├── useApiKey.ts            # Lesen/Schreiben/Löschen des API-Keys aus localStorage
│   └── useTodos.ts             # Fetch, Status (loading/error/success), Refresh
│
└── lib/
    ├── storage.ts              # localStorage-Abstraktion (getKey, setKey, removeKey)
    ├── todoist/
    │   ├── client.ts           # Todoist REST v2 API-Client-Funktionen
    │   └── types.ts            # TypeScript-Typen (Task, Project, Due, …)
    └── utils/
        └── date.ts             # Datums-Helpers: getLocalDateISO(), isToday()
```

---

## 2. Routing

| Route | Zweck | Voraussetzung |
|-------|-------|---------------|
| `/` | Redirect-Logik | — |
| `/setup` | MDP-1: API-Key eingeben | — |
| `/today` | MDP-2/3: Heutige Todos | API-Key in localStorage |

**Redirect-Logik in `app/page.tsx`:**
```
kein API-Key in localStorage → redirect("/setup")
API-Key vorhanden           → redirect("/today")
```
Dieses Check läuft client-seitig (`"use client"` + `useEffect`), da localStorage im Server-Rendering nicht verfügbar ist.

---

## 3. State Management

Kein externes State-Library (kein Redux/Zustand). Ausreichend für Single-User-App:

| State | Wo |
|-------|----|
| API-Key | `localStorage` + `useApiKey`-Hook |
| Todos (fetch-State) | `useTodos`-Hook (`useState` + `useEffect`) |
| UI-State (loading, error) | lokal in Komponenten |

---

## 4. localStorage-Schema

| Schlüssel | Inhalt | Feature |
|-----------|--------|---------|
| `todoist_api_key` | Todoist REST API Token (String) | MDP-1 |
| `msal.*` | OAuth-Token-Cache (automatisch von MSAL.js verwaltet) | MDP-4 |
| `notion_integration_token` | Notion Internal Integration Token (String) | MDP-5 |

Alle manuellen Keys werden vor dem Speichern per `.trim()` bereinigt.
MSAL.js schreibt seinen Token-Cache selbständig — diese Einträge nicht manuell anfassen.

---

## 5. API-Integration je Feature

### MDP-1 & MDP-2/3 — Todoist

**CORS:** Todoist REST v2 unterstützt direkte Browser-Calls ✓

```
Browser → Todoist REST v2 (api.todoist.com)
```

Relevante Endpoints:
| Endpoint | Zweck | Feature |
|----------|-------|---------|
| `GET /rest/v2/projects` | Key-Validierung | MDP-1 |
| `GET /rest/v2/tasks?filter=today` | Heutige Todos laden | MDP-2 |
| `POST /rest/v2/tasks/{id}/close` | Todo als erledigt markieren | MDP-3 |

**Client-Funktion in `lib/todoist/client.ts`:**
```typescript
async function todoistFetch<T>(endpoint: string, apiKey: string, options?: RequestInit): Promise<T>
```
Zentrale Fehlerbehandlung: 401 → `throw new UnauthorizedError()`, 5xx → `throw new TodoistUnavailableError()`

### MDP-4 — Microsoft Office 365 Kalender

**CORS:** Microsoft Graph API unterstützt direkte Browser-Calls ✓
**Auth:** OAuth 2.0 PKCE-Flow via MSAL.js — läuft vollständig im Browser, kein Backend nötig ✓

```
Browser → MSAL.js (PKCE OAuth) → Microsoft Identity Platform
Browser → Microsoft Graph API (graph.microsoft.com)
```

**Voraussetzung (einmalig durch Nutzer):**
Ein App-Registration in Azure AD (kostenlos) mit:
- Typ: **Single-Page Application (SPA)**
- Redirect URI: `http://localhost:3000` (dev) / `https://<domain>` (prod)
- API-Berechtigungen: `Calendars.Read` (delegiert)
- **Kein Client Secret** — PKCE-Flow benötigt keinen

Client ID und Tenant ID werden als **Next.js Public Env-Variablen** gespeichert (kein Geheimnis bei SPA-Apps):
```
NEXT_PUBLIC_AZURE_CLIENT_ID=...
NEXT_PUBLIC_AZURE_TENANT_ID=...
```

**Dependency:** `@azure/msal-browser`

**MSAL-Initialisierung** in `lib/msalConfig.ts`:
```typescript
const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: "localStorage" },
};
```

**Microsoft Graph Endpoint für heutige Termine:**
```
GET /v1.0/me/calendarView
  ?startDateTime={heute}T00:00:00
  &endDateTime={heute}T23:59:59
  &$select=subject,start,end,location,isAllDay
  &$orderby=start/dateTime
```

**Neue Dateien für MDP-4:**
```
lib/
  msalConfig.ts              # MSAL-Konfiguration
  microsoft/
    client.ts                # Graph API-Client mit MSAL-Token
    types.ts                 # CalendarEvent-Typen
hooks/
  useMsal.ts                 # Login-State, acquireToken
  useCalendarEvents.ts       # Fetch heutige Termine
components/
  calendar/
    CalendarList.tsx         # Terminliste
    CalendarItem.tsx         # Einzelner Termin
```

**Auth-Flow:**
```
1. useMsal prüft: ist Account in MSAL-Cache?
2. Nein → loginPopup() oder loginRedirect() → Nutzer loggt sich mit MS-Account ein
3. Ja  → acquireTokenSilent() → Token aus Cache
4. Token wird in Graph-Calls als Bearer-Header gesetzt
```

### MDP-5 — Notion

**CORS-Problem:** Die Notion API erlaubt **keine direkten Browser-Calls** (kein CORS-Header).

**Lösung:** Next.js Route Handler als schlanker Proxy:
```
Browser → /api/notion (Next.js Route Handler) → Notion API
```

Der Route Handler liest den `notion_integration_token` aus dem Request-Body (übermittelt vom Client) und leitet den Call an Notion weiter. **Kein Server, keine Datenbank** — der Next.js-Prozess fungiert nur als Relay.

---

## 6. Fehlerbehandlung — Standardmuster

Alle API-Fehler werden in custom Error-Klassen (`lib/todoist/types.ts`) gekapselt:

| HTTP-Status | Error-Klasse | UI-Verhalten |
|-------------|-------------|--------------|
| 401 / 403 | `UnauthorizedError` | Redirect → `/setup` + Hinweis "API-Key ungültig" |
| Netzwerkfehler | `NetworkError` | Fehlermeldung + Retry-Button |
| 5xx | `ServiceUnavailableError` | Fehlermeldung "Dienst nicht erreichbar" |

---

## 7. Typen (Todoist)

Kern-Typen in `lib/todoist/types.ts`:

```typescript
interface TodoistTask {
  id: string;
  content: string;
  project_id: string;
  priority: 1 | 2 | 3 | 4;   // 4=höchste, 1=keine (Todoist-Konvention)
  is_completed: boolean;
  due: { date: string; datetime?: string } | null;
}

interface TodoistProject {
  id: string;
  name: string;
  parent_id: string | null;
}
```

---

## 8. Prioritätsanzeige

Todoist kodiert Priorität invers (API: `priority: 4` = P1 = höchste):

| Todoist API `priority` | Anzeige | Farbe |
|------------------------|---------|-------|
| 4 | P1 | Rot |
| 3 | P2 | Orange |
| 2 | P3 | Blau |
| 1 | P4 (keine) | Grau |

Sortierung: `priority` absteigend (4 → 1), dann alphabetisch nach `content`.

---

## 9. Build-Reihenfolge & Abhängigkeiten

```
MDP-1 (storage.ts + ApiKeyForm + useApiKey)
  └─► MDP-2 (todoist/client.ts + TodoList + useTodos)
        └─► MDP-3 (TodoItem Checkbox + close-Endpoint)
MDP-4 (unabhängig — eigene Komponente + Hook)
MDP-5 (unabhängig — eigene Komponente + /api/notion Route Handler)
```

---

## 10. Offene Entscheidungen

| Thema | Optionen | Empfehlung |
|-------|---------|------------|
| MDP-4 OAuth-Flow | `loginPopup()` vs. `loginRedirect()` | `loginPopup()` (kein Seiten-Reload, bessere UX) |
| MDP-4 Tenant-Scope | Single-Tenant vs. Multi-Tenant | Single-Tenant (`NEXT_PUBLIC_AZURE_TENANT_ID`) — nur der eigene MS-Account |
| MDP-5 Notion-Inhalt | Embed-URL (iframe) vs. API-Proxy | API-Proxy (mehr Kontrolle, aber CORS-Workaround nötig) |
| Todoist "today" Filter | `filter=today` vs. client-seitig filtern nach `due.date` | `filter=today` (serverseitig, Todoist kennt Zeitzone) |
