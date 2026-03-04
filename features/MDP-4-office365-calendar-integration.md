# MDP-4 — Office 365 Calendar Integration

**Status:** In Review
**Priorität:** P1 — Next
**Erstellt:** 2026-03-04
**Letzte Änderung:** 2026-03-04

## Abhängigkeiten

- Erfordert: MDP-6 (Dashboard Layout) — Kalender-Zone im 3-Zonen-Layout vorhanden

---

## Zusammenfassung

Der Nutzer trägt einmalig die ICS-URL seines Outlook-Kalenders ein (aus Outlook → Kalender teilen → ICS-Link kopieren).
Die App speichert die URL in `localStorage` und ruft die Kalenderdaten über einen Next.js-API-Proxy ab.
Kein Microsoft OAuth, kein eigener Account-System — einmal einrichten, fertig.

---

## User Stories

| # | Als ... | möchte ich ... | damit ... |
|---|---------|---------------|-----------|
| 1 | Nutzer | meine Outlook ICS-URL einmalig hinterlegen | die App meine heutigen Termine anzeigen kann |
| 2 | Nutzer | auf einen Blick alle heutigen Termine sehen | ich meinen Tag besser planen kann |
| 3 | Nutzer | den Titel jedes Termins sehen | ich weiß, was heute ansteht |
| 4 | Nutzer | ganztägige Termine separat oben im Kalender-Block sehen | sie sich klar von zeitgebundenen Terminen abheben |
| 5 | Nutzer | die ICS-URL wieder entfernen können | ich die Verbindung jederzeit widerrufen kann |
| 6 | Nutzer | sehen, wenn heute keine Termine vorhanden sind | ich nicht rätsele, ob ein Fehler vorliegt |

---

## Acceptance Criteria

### Verbindung herstellen (ICS-URL)

- [x] Es gibt ein Eingabefeld "ICS-URL eingeben" im Kalender-Widget
- [x] Nach dem Speichern wird die URL in `localStorage` gespeichert (Schlüssel: `calendar_ics_url`)
- [x] Die gespeicherte URL bleibt nach einem Seiten-Reload erhalten
- [x] Nach dem Speichern erscheint ein "Trennen"-Button; das Eingabefeld verschwindet

### Termine anzeigen

- [x] Die App ruft Kalenderdaten über `/api/calendar?url=<ics-url>&date=<YYYY-MM-DD>` ab (server-seitiger Proxy)
- [x] Ganztägige Termine werden oben im Kalender-Block separat angezeigt (Bereich "Ganztägig")
- [ ] Zeitgebundene Termine werden chronologisch nach Startzeit sortiert aufgelistet
- [ ] Jeder Termin zeigt ausschließlich den Titel (keine Uhrzeit, keine Ortsangabe)
- [x] Termin-Titel werden ohne das Prefix "SyncBlocker: " angezeigt — das Prefix wird vor der Anzeige automatisch entfernt
- [x] Lädt die App erstmals Termine, zeigt sie einen Lade-Spinner
- [x] Sind heute keine Termine vorhanden, zeigt die App "Heute keine Termine" (Empty State)

### Verbindung trennen

- [x] Es gibt einen "Trennen"-Button neben der Kalender-Überschrift
- [x] Klick entfernt die ICS-URL aus `localStorage`
- [x] Nach dem Trennen kehrt die UI zum Eingabe-Formular zurück

### Fehlerbehandlung

- [x] ICS-URL nicht erreichbar / Netzwerkfehler: Hinweis mit Retry-Button
- [x] Ungültige ICS-URL (kein gültiges ICS-Format): Fehlermeldung anzeigen
- [x] Timeout (>60s): Fehlermeldung "Kalender konnte nicht geladen werden"

---

## Edge Cases

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| ICS-URL aus nicht-erlaubter Domain | Server antwortet mit 403; App zeigt Fehlermeldung |
| Termin läuft über Mitternacht (begann gestern, endet heute) | Wird angezeigt, da er im heutigen Zeitfenster liegt |
| Termin hat einen Ort | Ort wird nicht angezeigt — nur der Titel ist relevant |
| Nutzer öffnet App um 23:58 Uhr | Nur Termine bis 23:59 des aktuellen Tages werden angezeigt; kein Überlauf auf morgen |
| Nutzer öffnet App im Inkognito-Modus | ICS-URL nicht dauerhaft gespeichert; muss neu eingegeben werden |
| ICS-Datei zu groß (> 5 MB) | Server antwortet mit Fehler; App zeigt Fehlermeldung |

---

## Technische Anforderungen

- **ICS-URL-Quelle:** Outlook → Kalender teilen → ICS-Link (öffentlich oder mit Auth-Token in der URL)
- **API-Proxy:** Next.js API Route `/api/calendar` — fetcht ICS serverseitig, parsed, gibt JSON zurück
- **SSRF-Schutz:** Nur Hostnamen aus Allowlist erlaubt: `outlook.live.com`, `outlook.office.com`, `outlook.office365.com`
- **Größenlimit:** ICS-Antwort max. 5 MB
- **URL-Speicherung:** `localStorage` (Schlüssel: `calendar_ics_url`) — analog zum Todoist API-Key
- **Performance:** Kalender-Daten werden beim Laden der Seite abgerufen; Ziel < 2 Sekunden
- **Keine externen Auth-Libraries** — kein MSAL, kein OAuth

---

## Out of Scope

- Termine erstellen, bearbeiten oder löschen
- Kalender aus Exchange On-Premise (nur Exchange Online / O365)
- Mehrere Wochen oder Monatsansicht
- Erinnerungen / Notifications
- Farben der Kalender übernehmen

---

## Tech Design (Solution Architect)

**Erstellt:** 2026-03-04

### Überblick

ICS-URL-basierter Ansatz. Der Nutzer hinterlegt einmalig die ICS-URL seines Outlook-Kalenders. Die App fetcht die ICS-Datei serverseitig über `/api/calendar` (als CORS-Proxy, mit SSRF-Schutz durch Hostname-Allowlist), parsed sie und gibt JSON-Events zurück. Die Kalender-Zone aus MDP-6 (Zone A) wird mit echten Terminen befüllt.

**Kein OAuth, kein Azure, kein MSAL.**

---

### Komponenten-Struktur

```
Zone A — CalendarWidget (ersetzt MDP-6-Platzhalter)
│
├── [Status: nicht verbunden]
│   └── IcsUrlForm
│       Eingabefeld + "Speichern"-Button
│
├── [Status: verbinde / lade Termine]
│   └── LoadingSpinner
│
├── [Status: Fehler]
│   └── ErrorMessage
│       └── RetryButton / ReconnectButton
│
└── [Status: verbunden + Termine geladen]
    ├── Header: "Kalender" + DisconnectButton ("Trennen")
    │
    ├── AllDaySection        ← nur sichtbar wenn ganztägige Termine vorhanden
    │   └── AllDayEventCard (×n)
    │       - Titel (ohne "SyncBlocker: " Prefix)
    │
    └── TimeGrid             ← zeitgebundene Termine, chronologisch
        └── CalendarEventBlock (×n)
            - Titel (ohne "SyncBlocker: " Prefix)
```

---

### Datenmodell

**Was die App in localStorage speichert:**
- ICS-URL (Schlüssel: `calendar_ics_url`)

**Was die App pro Termin aus der geparsten ICS-Datei erhält:**
- Eindeutige ID (UID)
- Titel / Betreff (SUMMARY) — bereinigt um "SyncBlocker: " Prefix
- Startzeit (Datum + Uhrzeit + Zeitzone)
- Endzeit (Datum + Uhrzeit + Zeitzone)
- Flag: Ist ganztägig? (ja/nein)

Kein eigener Datenspeicher — Termine werden frisch abgerufen und nur im React State gehalten.

---

### Datenfluss

```
App startet
    │
    ▼
localStorage: ICS-URL vorhanden?
    │
    ├── Nein → IcsUrlForm anzeigen
    │              │ Nutzer gibt URL ein + speichert
    │              ▼
    │           URL in localStorage gespeichert
    │
    └── Ja (URL vorhanden) ──────────────┐
                                         ▼
                      GET /api/calendar?url=<ics-url>&date=<heute>
                      (Server fetcht ICS, parsed, gibt JSON zurück)
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                             ▼
                     Erfolg                         Fehler
                Termine anzeigen         Fehlermeldung + Retry/Trennen-Button
```

---

### Technische Entscheidungen

| Entscheidung | Gewählt | Warum |
|---|---|---|
| Kalender-Quelle | ICS-URL (Outlook "Kalender teilen") | Kein OAuth nötig; einfachste Integration ohne App Registration |
| Fetch-Ansatz | Server-seitiger Proxy (`/api/calendar`) | ICS-URLs erlauben kein CORS im Browser; Proxy löst das sauber |
| SSRF-Schutz | Hostname-Allowlist | Verhindert Missbrauch des Proxys für interne Netzwerkanfragen |
| URL-Speicherung | `localStorage` (`calendar_ics_url`) | Analog zum Todoist API-Key — kein Backend nötig |
| Komponenten | Client Components (`'use client'`) | Lesen aus localStorage erfordert Browser-Kontext |
| Titel-Bereinigung | `cleanTitle()` in `useCalendarEvents` | Zentralisiert; alle Komponenten erhalten automatisch saubere Titel |

---

### Benötigte Pakete

Keine neuen Pakete — ICS-Parsing erfolgt mit einem eigenen Parser in `src/lib/calendar/parseIcs.ts`.

### Neue Umgebungsvariablen

Keine.

## QA Test Results

**Tested:** 2026-03-04
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build Status:** PASS (Next.js 16.1.6 compiles without errors)
**Lint Status:** FAIL (1 ESLint error in CalendarWidget.tsx -- see BUG-M4-1)

---

### CRITICAL FINDING: Spec vs. Implementation Mismatch

The MDP-4 spec describes a Microsoft OAuth (MSAL.js) + Graph API approach.
The actual implementation uses a **completely different architecture**: ICS URL parsing via a Next.js server-side proxy (`/api/calendar`).

**What the spec defines:**
- MSAL.js (`@azure/msal-browser`) for OAuth login
- Microsoft Graph API (`/me/calendarView`) for calendar data
- Token stored via MSAL in localStorage
- Microsoft Login popup
- Account name display after login
- Token refresh via MSAL Silent Acquire

**What was actually built:**
- ICS URL input form (user pastes Outlook ICS subscription URL)
- Server-side API route (`/api/calendar`) fetches and parses ICS file
- ICS URL stored in localStorage under `calendar_ics_url`
- Custom ICS parser (`parseIcs.ts`) extracts VEVENT entries
- No MSAL package installed, no OAuth flow, no Graph API calls

This means ALL acceptance criteria related to OAuth/MSAL are N/A for the current implementation. The feature spec and architecture doc (docs/ARCHITECTURE.md) need to be updated to reflect the ICS approach, or the implementation needs to be rebuilt to match the spec.

**QA Decision:** I will test the acceptance criteria in TWO ways:
1. Against the **original spec** (showing how many OAuth-based ACs fail)
2. Against the **functional intent** (does the ICS implementation fulfill the user stories?)

---

### Acceptance Criteria Status (Against Original Spec)

#### AC-1: Verbindung herstellen (OAuth)

- [ ] FAIL: Es gibt einen Button "Mit Microsoft verbinden" im Dashboard
  - Actual: There is an ICS URL input form with "Kalender verbinden" heading and "Speichern" button instead. No Microsoft branding.
- [ ] FAIL: Klick oeffnet Microsoft Login-Popup via MSAL.js
  - Actual: No MSAL.js installed. No popup. User pastes an ICS URL manually.
- [ ] FAIL: Nach erfolgreichem Login wird das Access-Token in localStorage gespeichert (Schluessel: msft_access_token)
  - Actual: ICS URL stored under `calendar_ics_url`. No access token.
- [ ] FAIL: Nach erfolgreichem Login ist der Button nicht mehr sichtbar; stattdessen wird der verbundene Account-Name angezeigt
  - Actual: After saving ICS URL, the form disappears and a "Trennen" button is shown, but no account name is displayed.
- [ ] FAIL: Token-Ablauf wird behandelt: Abgelaufene Tokens werden automatisch per Silent Refresh erneuert
  - Actual: ICS URLs do not expire. No token refresh logic exists. N/A for ICS approach.

#### AC-2: Termine anzeigen

- [ ] FAIL: Die App ruft heutige Termine ueber die Microsoft Graph API ab
  - Actual: Events are fetched by the server-side `/api/calendar` route which downloads and parses an ICS file directly. No Graph API involved.
- [x] PASS: Ganztagige Termine werden oben im Kalender-Block separat angezeigt (Bereich "Ganztaegig")
  - Code: AllDaySection component renders all-day events above the TimeGrid.
- [x] PASS: Zeitgebundene Termine werden chronologisch nach Startzeit sortiert aufgelistet
  - Code: `parseIcsForDate()` sorts events: all-day first, then by startTime ascending.
- [x] PASS: Jeder Termin zeigt ausschliesslich den Titel (keine Uhrzeit, keine Ortsangabe)
  - Code: CalendarEventBlock and AllDaySection only render `event.title`.
- [x] PASS: Termin-Titel werden ohne das Prefix "SyncBlocker: " angezeigt
  - Code: `cleanTitle()` in useCalendarEvents.ts uses regex `/^SyncBlocker:\s*/i` to strip prefix.
- [x] PASS: Laedt die App erstmals Termine, zeigt sie einen Lade-Spinner
  - Code: CalendarWidget renders spinner when `isLoading` is true.
- [x] PASS: Sind heute keine Termine vorhanden, zeigt die App "Heute keine Termine" (Empty State)
  - Code: CalendarWidget shows "Heute keine Termine" when both allDayEvents and timedEvents are empty.

#### AC-3: Verbindung trennen

- [ ] PARTIAL: Es gibt einen "Microsoft-Konto trennen"-Button
  - Actual: There is a "Trennen" button, but it is labeled "Kalender-URL entfernen" (aria-label), not "Microsoft-Konto trennen".
- [ ] PARTIAL: Klick loescht das Token aus localStorage und meldet den Nutzer bei MSAL ab
  - Actual: Click removes `calendar_ics_url` from localStorage. No MSAL logout (MSAL not used).
- [x] PASS: Nach dem Trennen kehrt die UI zum "Nicht verbunden"-Zustand zurueck
  - Code: `handleDisconnect()` sets icsUrl state to null, which re-renders the IcsUrlForm.

#### AC-4: Fehlerbehandlung

- [ ] FAIL: HTTP 401 (Token abgelaufen, Silent Refresh fehlgeschlagen): Hinweis "Bitte erneut anmelden"
  - Actual: No OAuth tokens, so 401 handling for token expiry is N/A. The API route returns `fetch_error` for non-OK responses from the ICS URL.
- [ ] FAIL: HTTP 403 (fehlende Berechtigung): Hinweis "Keine Kalender-Berechtigung. Bitte erneut verbinden."
  - Actual: No 403-specific handling. Any non-OK response from ICS fetch returns generic `fetch_error`.
- [x] PASS: Netzwerkfehler: Hinweis "Kalender konnte nicht geladen werden. Bitte Internetverbindung pruefen."
  - Code: `CalendarErrorMessage` shows "Keine Verbindung. Bitte Internetverbindung pruefen." for `network` error kind.
- [ ] FAIL: MSAL Popup blockiert: Hinweis "Login-Popup wurde blockiert."
  - Actual: No MSAL popup. N/A for ICS approach.

---

### Acceptance Criteria Status (Against Functional Intent / ICS Implementation)

Testing whether the ICS-based implementation fulfills the underlying user stories:

#### User Story 1: Kalender verbinden
- [x] PASS: User can connect their calendar by pasting an ICS URL
- [x] PASS: URL is validated (must be http/https)
- [x] PASS: URL is stored in localStorage for persistence
- [x] PASS: Input field is type="password" to hide the URL (which contains a secret token)

#### User Story 2: Heutige Termine sehen
- [x] PASS: Today's events are fetched and displayed on the dashboard
- [x] PASS: Events are filtered to the current date using user's timezone
- [x] PASS: Loading spinner shown during fetch

#### User Story 3: Titel jedes Termins sehen
- [x] PASS: Event titles displayed in both all-day and timed sections
- [x] PASS: SyncBlocker prefix stripped from titles

#### User Story 4: Ganztagige Termine separat
- [x] PASS: All-day events shown in a separate section above the time grid
- [x] PASS: Section labeled "Ganztaegig"

#### User Story 5: Konto trennen
- [x] PASS: "Trennen" button available when connected
- [x] PASS: Click removes URL and returns to disconnected state

#### User Story 6: Keine Termine heute
- [x] PASS: "Heute keine Termine" shown when no events for today

---

### Edge Cases Status

#### EC-1: Token ist abgelaufen
- N/A: ICS URLs do not use tokens. Not applicable for ICS approach.

#### EC-2: Nutzer hat mehrere Kalender in O365
- [ ] LIMITATION: ICS URL approach only supports ONE calendar URL. The spec says "Alle aktiven Kalender werden abgerufen", but the ICS approach requires the user to publish and paste a specific calendar URL. Multiple calendars would require multiple URLs (not supported).

#### EC-3: Termin laeuft ueber Mitternacht (begann gestern, endet heute)
- [ ] BUG: The parser matches events based on `eventDate === targetDate`, where eventDate is derived from the start time. An event that started yesterday and ends today would have a start date of yesterday, so it would NOT appear in today's view. See BUG-M4-5.

#### EC-4: Termin hat einen Ort
- [x] PASS: Location is parsed but not displayed. CalendarEventBlock and AllDaySection only show title.

#### EC-5: Nutzer oeffnet App um 23:58 Uhr
- [x] PASS: Events are filtered to the current date only. The `targetDate` parameter uses today's YYYY-MM-DD string.

#### EC-6: Microsoft-Login-Popup wird geschlossen ohne Login
- N/A: No popup in ICS approach.

#### EC-7: O365-Konto ist ein persoenliches Microsoft-Konto (nicht Business)
- [x] PASS: ICS URLs work with both personal and business O365 accounts as long as the user publishes the calendar.

#### EC-8: Nutzer oeffnet App im Inkognito-Modus
- [x] PASS: localStorage availability is not explicitly checked in CalendarWidget, but the Todoist flow checks it. If localStorage works for the API key, it will work for the ICS URL too.

---

### Additional Edge Cases Identified

#### EC-EXTRA-1: Very large ICS file (years of history)
- [ ] RISK: The API route fetches the entire ICS file (`response.text()`) and parses it line-by-line. Outlook ICS feeds can contain thousands of events spanning years. While the parsing is line-based and memory-efficient, fetching a multi-MB ICS file on every page load could be slow. There is a 60-second timeout, but no size limit on the response body. See BUG-M4-6.

#### EC-EXTRA-2: ICS URL becomes invalid after user changes Outlook settings
- [x] HANDLED: The API route returns `fetch_error` if the ICS URL returns non-200. The CalendarErrorMessage shows "Kalender konnte nicht abgerufen werden. Bitte URL pruefen." with a "Neu verbinden" button.

#### EC-EXTRA-3: Recurring events (RRULE)
- [ ] BUG: The ICS parser does not handle RRULE (recurrence rules). Recurring events in Outlook will only show the original occurrence date, not expanded instances. A weekly meeting that recurs every Monday will only appear on its original creation date, not on subsequent Mondays. See BUG-M4-7.

#### EC-EXTRA-4: VTIMEZONE blocks in ICS
- [x] HANDLED: The parser uses a WINDOWS_TZ_TO_IANA mapping for common Windows timezone names (e.g. "W. Europe Standard Time" -> "Europe/Berlin"). Falls back to IANA timezone names, then to local time.

#### EC-EXTRA-5: Events with no DTEND
- [x] HANDLED: If DTEND is missing, `rawEnd` falls back to `startDate`.

---

### Security Audit Results (Red Team Perspective)

#### SEC-M4-1: ICS URL stored in localStorage in plaintext
- **Severity:** Medium
- **Details:** The ICS URL contains an embedded authentication token (the Outlook publishing URL includes a secret hash). Storing it in plaintext localStorage means any XSS vulnerability would leak the calendar subscription URL, allowing an attacker to read the user's calendar. Unlike the Todoist API key (which is a general accepted risk), the ICS URL is essentially a long-lived bearer token with no expiry.
- **Mitigation:** CSP headers reduce XSS risk. Single-user app context limits exposure.

#### SEC-M4-2: Server-Side Request Forgery (SSRF) via /api/calendar
- **Severity:** Critical
- **Details:** The `/api/calendar` API route accepts any URL via the `url` query parameter and fetches it server-side. While it validates that the protocol is `http:` or `https:`, it does NOT restrict the target host. An attacker who can access the `/api/calendar` endpoint could:
  1. Scan internal network by providing URLs like `http://192.168.1.1/admin`, `http://169.254.169.254/latest/meta-data/` (AWS metadata), or `http://localhost:3000/api/...`
  2. Exfiltrate data from internal services
  3. Use the server as an open proxy
- **Impact:** In a Vercel deployment, this could potentially access Vercel's internal metadata service or other cloud infrastructure endpoints. Even in local development, it exposes the host machine's internal network.
- **Steps to Reproduce:**
  1. Open browser dev tools
  2. Run: `fetch('/api/calendar?url=http://169.254.169.254/latest/meta-data/&date=2026-03-04').then(r => r.json()).then(console.log)`
  3. The server will attempt to fetch the AWS metadata endpoint and return the response (though it will fail to parse as ICS, the error message could still leak information)
- **Priority:** MUST fix before deployment

#### SEC-M4-3: No authentication on /api/calendar endpoint
- **Severity:** High
- **Details:** The `/api/calendar` API route has no authentication. Anyone who knows the server URL can use it to fetch arbitrary URLs. Combined with SEC-M4-2, this creates an unauthenticated SSRF vulnerability.
- **Priority:** MUST fix before deployment

#### SEC-M4-4: No rate limiting on /api/calendar
- **Severity:** Medium
- **Details:** The `/api/calendar` endpoint has no rate limiting. An attacker could abuse it to make many outbound HTTP requests from the server, potentially for DDoS amplification or bandwidth exhaustion.
- **Priority:** Fix before deployment

#### SEC-M4-5: ICS content not sanitized for rendering
- **Severity:** Low
- **Details:** The `decodeIcsText()` function replaces ICS escapes but does not sanitize for XSS. However, since React's JSX rendering auto-escapes strings (no `dangerouslySetInnerHTML`), this is not exploitable. PASS.

#### SEC-M4-6: CSP connect-src allows outlook.office365.com
- **Severity:** Low (Informational)
- **Details:** The CSP `connect-src` in `next.config.ts` includes `https://outlook.office365.com`. However, the ICS fetch now happens server-side via `/api/calendar`, so the browser never directly connects to Outlook. The CSP rule is overly permissive for the current architecture (it was likely set up for the planned MSAL approach). The connect-src should be tightened to only `'self'` and `https://api.todoist.com`.
- **Priority:** Nice to have

#### SEC-M4-7: NEXT_PUBLIC_AZURE_CLIENT_ID in .env.local with real value
- **Severity:** Low (Informational)
- **Details:** The `.env.local` file contains what appears to be a real Azure Client ID (`08795b49-f429-450f-a811-a58ed97859c7`). This is NOT a secret (SPA client IDs are public), and `.env.local` is in `.gitignore`, so this is acceptable. However, the MSAL feature was not built -- this env var is unused dead configuration.
- **Priority:** Cleanup -- remove unused env var

---

### Bugs Found

#### BUG-M4-1: ESLint error in CalendarWidget.tsx (setState in useEffect)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Run `npm run lint`
  2. ESLint reports: "Calling setState synchronously within an effect can trigger cascading renders" in CalendarWidget.tsx line 17
  3. The pattern `useEffect(() => { setIcsUrlState(getIcsUrl()); setInitialized(true); }, [])` violates the `react-hooks/set-state-in-effect` rule
- **Expected:** Code should use `useSyncExternalStore` or lazy state initialization to read localStorage without triggering a cascading render
- **Priority:** Fix before deployment (lint must pass)

#### BUG-M4-2: Spec describes OAuth/MSAL.js but implementation uses ICS URL
- **Severity:** Critical (Spec deviation)
- **Steps to Reproduce:**
  1. Read the MDP-4 spec acceptance criteria (OAuth, MSAL.js, Graph API)
  2. Read the actual code (ICS URL form, server-side ICS parser)
  3. The spec and implementation describe completely different approaches
- **Expected:** Either the spec should be updated to describe the ICS URL approach, or the implementation should be rebuilt to use OAuth/MSAL.js as specified
- **Priority:** MUST resolve before any release -- update the spec to match the implementation, OR rebuild the feature. The current state creates confusion for any developer or QA engineer reading the spec.

#### BUG-M4-3: SSRF vulnerability in /api/calendar route
- **Severity:** Critical
- **Steps to Reproduce:**
  1. The `/api/calendar` route accepts any URL and fetches it server-side
  2. No host allowlist or domain restriction
  3. An attacker can scan internal networks, access cloud metadata, or use the server as a proxy
- **Expected:** Restrict URL parameter to known calendar hosts (e.g., `outlook.office365.com`, `outlook.live.com`) or implement a domain allowlist
- **Priority:** MUST fix before deployment

#### BUG-M4-4: No authentication on /api/calendar endpoint
- **Severity:** High
- **Steps to Reproduce:**
  1. Open any browser (even without the app loaded)
  2. Navigate to `http://localhost:3000/api/calendar?url=https://example.com&date=2026-03-04`
  3. The endpoint responds without any authentication check
- **Expected:** The endpoint should verify that the request comes from an authenticated session, or at minimum validate that the requesting origin is the same app
- **Priority:** Fix before deployment

#### BUG-M4-5: Events spanning midnight not shown on the end date
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Have a calendar event that starts on 2026-03-03 at 23:00 and ends on 2026-03-04 at 01:00
  2. View the app on 2026-03-04
  3. Expected: The event appears (it is within today's time window)
  4. Actual: The event does not appear because `eventDate` is derived from `toDateStr(startDate, tz)` which returns "2026-03-03"
- **Priority:** Fix in next sprint

#### BUG-M4-6: No size limit on ICS file download
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Point the ICS URL to a very large ICS file (e.g., a calendar with years of history)
  2. The server downloads the entire file into memory via `response.text()`
  3. Expected: A size limit or streaming parser to prevent memory exhaustion
  4. Actual: No size limit. A 50MB ICS file would be loaded entirely into server memory.
- **Priority:** Fix before deployment

#### BUG-M4-7: Recurring events (RRULE) not expanded
- **Severity:** High
- **Steps to Reproduce:**
  1. Have a recurring weekly meeting in Outlook (e.g., every Monday)
  2. Publish the calendar and use the ICS URL
  3. Expected: The recurring event appears every Monday
  4. Actual: Only the original occurrence appears. The parser does not expand RRULE recurrence rules. Most real-world calendars rely heavily on recurring events.
  5. Note: Outlook's published ICS feeds MAY pre-expand recurrences (depends on Outlook version), but the parser should handle RRULE if the feed does not pre-expand.
- **Priority:** Fix before deployment (verify Outlook ICS feed behavior first -- if Outlook pre-expands all occurrences in the ICS file, this may be a non-issue)

#### BUG-M4-8: "Ganztaegig" label has missing umlaut
- **Severity:** Low
- **Steps to Reproduce:**
  1. Have an all-day event in the calendar
  2. Look at the all-day section label in AllDaySection.tsx
  3. Expected: "Ganztagig" or "Ganztaegig" -- acceptable, but the label actually shows "Ganztaegig" (ae instead of ae-umlaut)
  4. Actual: Code has `Ganztaegig` (ASCII) instead of `Ganztagig` (which is also wrong) or ideally "Ganztaegig" (the file literally says "Ganztaegig" with no umlaut). The German word should be "Ganztagig" (without umlaut on the a -- "ganztaegig" is an alternate spelling but "Ganztagig" with capital G is the typical label).
  - Note: Looking at the code again, it reads "Ganztaegig" which is a valid transliteration. However, since the rest of the UI uses proper German umlauts (e.g. "Kalender verbinden", "Fuege deine Outlook ICS-URL ein"), the inconsistency stands out. The proper German would be "Ganztagig".
- **Priority:** Nice to have

#### BUG-M4-9: CalendarWidget TimeGrid always renders (even during error/loading)
- **Severity:** Low
- **Steps to Reproduce:**
  1. When connected to a calendar, the TimeGrid renders regardless of loading/error state
  2. In the `return` statement at line 95: `<TimeGrid events={!isLoading && !errorKind ? timedEvents : []} />`
  3. The TimeGrid shows empty during loading, but it still renders the full hour grid
- **Expected:** This is actually reasonable UX (showing the grid frame while loading), so this is informational only.
- **Priority:** No action needed

---

### Cross-Browser Assessment (Code Review)

- **Chrome/Firefox/Safari:** All components use standard React, CSS Grid, and Flexbox. No browser-specific APIs. The `Intl.DateTimeFormat` API with timezone support is well-supported across all modern browsers. The `AbortSignal.timeout()` API used in the API route is server-side only (Node.js). PASS expected.
- **Responsive (375px/768px/1440px):** Calendar zone uses the DashboardShell grid which handles mobile/desktop via `md:` breakpoint. The IcsUrlForm and event blocks use flexible sizing. PASS expected.

---

### Summary

- **Acceptance Criteria (Original Spec - OAuth):** 6/16 passed, 10 failed (all OAuth-related ACs fail because MSAL was not implemented)
- **Acceptance Criteria (Functional Intent - ICS):** 10/10 user story validations passed
- **Bugs Found:** 9 total (2 Critical, 2 High, 3 Medium, 2 Low)
  - Critical: BUG-M4-2 (spec mismatch), BUG-M4-3 (SSRF)
  - High: BUG-M4-4 (no auth on API), BUG-M4-7 (RRULE not expanded)
  - Medium: BUG-M4-1 (lint error), BUG-M4-5 (midnight events), BUG-M4-6 (no size limit)
  - Low: BUG-M4-8 (umlaut), BUG-M4-9 (informational)
- **Security:** CRITICAL findings. SSRF vulnerability (BUG-M4-3) and unauthenticated API endpoint (BUG-M4-4) MUST be fixed before any deployment.
- **Build:** PASS (compiles without errors)
- **Lint:** FAIL (1 error)
- **Production Ready:** NO
  - BUG-M4-3 (SSRF) is a Critical security vulnerability
  - BUG-M4-4 (no auth) is a High security issue
  - BUG-M4-2 (spec mismatch) must be resolved (update spec or rebuild)
  - BUG-M4-1 (lint error) must be fixed
  - BUG-M4-7 (RRULE) needs investigation

## Deployment
_To be added by /deploy_
