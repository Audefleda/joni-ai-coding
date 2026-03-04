# MDP-6 — Dashboard Layout (3-Zonen-Struktur)

**Status:** In Review
**Priorität:** P0 — MVP
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03

---

## Zusammenfassung

Die `/today`-Seite wird in drei klar getrennte Zonen aufgeteilt, angelehnt an das Layout des Emergent Task Planner (ETP). Die Gesamtstruktur orientiert sich an einem A4-Hochformat-Raster:

- **Zone A (links, 1/3 Breite):** Tages-Kalender — vertikale Stundenspalte von 6:00 bis 22:00
- **Zone B (rechts oben, 2/3 Breite):** Heutige Todos mit Zeitschätzungs-Bubbles
- **Zone C (rechts unten, 2/3 Breite):** Platzhalter für Notion-Einbettung (MDP-5)

Dieses Feature definiert den strukturellen Rahmen. Die Inhalte der Zonen A und C werden durch spätere Features befüllt (MDP-4, MDP-5).

---

## Abhängigkeiten

- **Voraussetzung:** MDP-1 (API-Key), MDP-2 (Todos abrufen)
- **Erweitert:** MDP-2 (fügt Zeitschätzungs-UI zu bestehenden Todos hinzu)
- **Vorbereitet für:** MDP-4 (Google Calendar → Zone A), MDP-5 (Notion → Zone C)

---

## User Stories

| # | Als ... | möchte ich ... | damit ... |
|---|---------|---------------|-----------|
| 1 | Nutzer | auf einen Blick Kalender und Todos nebeneinander sehen | ich meinen Tag ohne Tab-Wechsel überblicken kann |
| 2 | Nutzer | jedem Todo eine Zeitschätzung in 15-Minuten-Schritten zuweisen | ich realistisch planen kann, wie viel Zeit mein Tag benötigt |
| 3 | Nutzer | den Gesamtzeitbedarf aller Todos summiert sehen | ich erkenne, ob mein Tag überladen ist |
| 4 | Nutzer | die Notion-Seite im selben Fenster sehen | ich nicht zwischen Apps wechseln muss |
| 5 | Nutzer | das Layout auch auf einem 13"-Laptop nutzen | ich die App im Alltag einsetzen kann |

---

## Acceptance Criteria

### Layout-Struktur

- [ ] Die Seite ist in zwei Hauptspalten aufgeteilt: links 1/3, rechts 2/3
- [ ] Die rechte Spalte ist vertikal in zwei Bereiche geteilt: Todos oben (~60%), Notion-Bereich unten (~40%)
- [ ] Alle drei Zonen sind durch eine klare visuelle Trennung (Linie oder Abstand) voneinander abgegrenzt
- [ ] Das Layout füllt den sichtbaren Viewport aus (kein unnötiges Scrollen auf Desktop 1280px+)
- [ ] Auf Viewports < 768px (Mobile) wechselt das Layout in eine einspaltige Ansicht: Zone B → Zone A → Zone C (von oben nach unten)

### Zone A — Kalender-Spalte

- [ ] Zone A zeigt einen vertikalen Stunden-Raster von 6:00 bis 22:00 Uhr (17 Stunden à 1 Zeile)
- [ ] Jede Stunde ist mit ihrer Uhrzeit beschriftet (z. B. "08:00")
- [ ] Die aktuelle Uhrzeit ist mit einer horizontalen Linie hervorgehoben (roter Strich oder ähnliche Markierung)
- [ ] Zone A zeigt einen Text-Platzhalter: "Kalender folgt in MDP-4" — sichtbar, wenn MDP-4 noch nicht integriert ist
- [ ] Die Höhe einer Stunden-Zeile entspricht visuell ca. einer Zeile (kein aufwändiges Proportional-Scaling im MVP)

### Zone B — Todos mit Zeitschätzung

- [ ] Die bestehende Todo-Liste (MDP-2) wird in Zone B eingebettet, Layout und Funktionalität bleiben erhalten
- [ ] Jedes Todo-Element zeigt zusätzlich eine Zeile mit **Zeitschätzungs-Bubbles** (Kreise, à 15 Minuten)
- [ ] Pro Todo werden **16 Bubbles** angezeigt (= 4 Stunden in 15-Minuten-Schritten), angeordnet in 2 Reihen à 8
- [ ] Ein Klick auf eine Bubble füllt alle Bubbles bis zu dieser Position (inklusive) — wie ein Schieberegler
- [ ] Ein erneuter Klick auf die bereits letzte ausgefüllte Bubble leert alle Bubbles (auf 0 zurücksetzen)
- [ ] Ausgefüllte Bubbles werden visuell von leeren unterschieden (gefüllt = dunkel, leer = Outline)
- [ ] Unterhalb der Bubbles wird die geschätzte Zeit in Textform angezeigt: "45 Min" oder "1 Std 30 Min"
- [ ] Die Zeitschätzung wird **nur im Browser-Memory gespeichert** (kein Persist, kein localStorage im MVP) — sie geht beim Neuladen verloren
- [ ] Oberhalb der Todo-Liste wird die **Summe aller Zeitschätzungen** angezeigt: "Heute geplant: 3 Std 15 Min"

### Zone C — Notion-Platzhalter

- [ ] Zone C zeigt einen klar abgegrenzten Bereich mit dem Platzhalter-Text "Notion-Seite folgt in MDP-5"
- [ ] Der Bereich hat die gleiche Hintergrundfarbe/-struktur wie der Rest des Dashboards (kein auffälliger Dummy-Rahmen)
- [ ] Zone C ist in ihrer Höhe proportional zum Viewport (ca. 35-40% der Seitengesamthöhe auf Desktop)

### Header / Navigation

- [ ] Das Datum des heutigen Tages wird prominent oben auf der Seite angezeigt (z. B. "Dienstag, 3. März 2026")
- [ ] Das Datum wird in deutscher Sprache ausgegeben
- [ ] Der bestehende "API-Key ändern"-Link (MDP-1) bleibt erhalten, wird aber in eine unauffällige Position (Footer oder Icon) verschoben

---

## Edge Cases

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| Nutzer schätzt mehr als 16 Bubbles (>4h) | Kein weiteres Klicken möglich; Maximum bei 16 Bubbles; optional: visuelles Feedback |
| Summe aller Todos übersteigt 8 Stunden | Summe wird rot eingefärbt als Warnung "Vorsicht: >8h geplant" |
| Keine Todos vorhanden | Zone B zeigt leeren Zustand wie in MDP-2; Zeitschätzungs-Summe zeigt "0 Min" |
| Viewport 768px–1280px (Laptop 13") | 2-Spalten-Layout bleibt erhalten; Bubbles verkleinern sich leicht |
| Viewport < 768px | 1-Spalten-Layout: Zone B zuerst, dann Zone A, dann Zone C |
| Seite wird neu geladen | Zeitschätzungen sind zurückgesetzt (kein Persist im MVP — dokumentiertes Verhalten) |
| Zone A und Zone C leer (MDP-4/5 nicht gebaut) | Platzhalter-Texte werden angezeigt; Layout-Proportionen bleiben identisch |

---

## Out of Scope

- Kalender-Events in Zone A anzeigen (→ MDP-4)
- Notion-Inhalte in Zone C einbetten (→ MDP-5)
- Zeitschätzungen persistent speichern (→ späteres Feature oder Teil von MDP-3/4)
- Drag & Drop von Todos in die Zeitliste
- Zeitschätzungen mit der Kalender-Zone A synchronisieren
- Zeiterfassung (Time Tracking — wann wurde eine Aufgabe tatsächlich erledigt)

---

## Visuelle Referenz

Das Layout orientiert sich am **Emergent Task Planner (ETP) A4**:

```
┌─────────────────┬─────────────────────────────────┐
│                 │  Dienstag, 3. März 2026           │
│  ZONE A         ├─────────────────────────────────┤
│  (Kalender)     │  ZONE B (Todos)                  │
│                 │                                   │
│  06:00  ──────  │  ○ Task 1     ●●●●○○○○           │
│  07:00  ──────  │               ○○○○○○○○  45 Min   │
│  08:00  ──────  │                                   │
│  09:00 ►──────  │  ○ Task 2     ●●●●●●●●           │
│  10:00  ──────  │               ●●○○○○○○  1h 30Min │
│  ...    ──────  │                                   │
│                 │  Heute geplant: 2 Std 15 Min      │
│  22:00  ──────  ├─────────────────────────────────┤
│                 │  ZONE C (Notion-Platzhalter)      │
└─────────────────┴─────────────────────────────────┘
```

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
src/app/today/page.tsx                ← wird zur Layout-Shell umgebaut
  └── DashboardShell                  ← neu: CSS Grid, 3 Zonen
        ├── DashboardHeader           ← neu: deutsches Datum + Settings-Link
        ├── TimeGrid                  ← neu: Zone A (Stunden 6–22, Jetzt-Linie)
        ├── TodosZone                 ← neu: Zone B Wrapper
        │     ├── EstimateSummary     ← neu: "Heute geplant: X Std Y Min"
        │     ├── TodoList            ← bestehend (unverändert)
        │     │     └── TodoItem      ← erweitert: + TimeEstimateBubbles
        │     └── TimeEstimateBubbles ← neu: 16 Kreise à 15 Min
        └── NotionZone                ← neu: Zone C Platzhalter
```

### Zustandsmodell

Zeitschätzungen leben nur im React-Speicher (kein Server, kein localStorage):

```
useTimeEstimates(taskIds)
  Speichert:   { [taskId]: Anzahl gefüllter Bubbles (0–16) }
  Gibt zurück: estimates, setEstimate(taskId, bubbles), totalMinutes
```

Der Hook sitzt in `TodosZone`, damit `EstimateSummary` Zugriff auf alle Werte hat.

### Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/components/dashboard/DashboardShell.tsx` | CSS-Grid-Wrapper mit 3 Zonen |
| `src/components/dashboard/DashboardHeader.tsx` | Datum (de-DE) + Settings-Link |
| `src/components/calendar/TimeGrid.tsx` | Zone A: Stunden-Raster + Jetzt-Linie |
| `src/components/todos/TodosZone.tsx` | Zone B Wrapper mit Summen-Header |
| `src/components/todos/EstimateSummary.tsx` | "Heute geplant: X Std Y Min" |
| `src/components/todos/TimeEstimateBubbles.tsx` | 16 Bubble-Kreise à 15 Min |
| `src/hooks/useTimeEstimates.ts` | In-Memory-State für Zeitschätzungen |
| `src/components/dashboard/NotionZone.tsx` | Zone C Platzhalter |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/app/today/page.tsx` | Wird zum reinen Layout-Container (DashboardShell) |
| `src/components/todos/TodoItem.tsx` | Erhält optionalen Slot für TimeEstimateBubbles |

### Technische Entscheidungen

| Entscheidung | Begründung |
|---|---|
| CSS Grid (Tailwind) für Layout | Eine Zeile Konfiguration, kein Extra-Package |
| `Intl.DateTimeFormat('de-DE')` für Datum | Eingebaut im Browser, keine date-Lib nötig |
| `useEffect` für Jetzt-Linie (minütlich) | Einfach, kein Ticker-Package nötig |
| Reines React-State für Bubbles | Spec: kein Persist im MVP |
| Keine neuen Packages | Tailwind + React-Bordmittel reichen aus |

## QA Test Results

**Tested:** 2026-03-04 (Re-test after MDP-4 integration)
**Previous Test:** 2026-03-03
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build Status:** PASS (Next.js 16.1.6 compiles without errors)
**Lint Status:** FAIL (1 ESLint error in CalendarWidget.tsx -- see MDP-4 BUG-M4-1)

---

### Acceptance Criteria Status

#### AC-1: Layout-Struktur

- [x] Die Seite ist in zwei Hauptspalten aufgeteilt: links 1/3, rechts 2/3
  - Code: `md:grid-cols-[1fr_2fr]` in DashboardShell.tsx -- correct ratio. Unchanged since last test.
- [x] Die rechte Spalte ist vertikal in zwei Bereiche geteilt: Todos oben (~60%), Notion-Bereich unten (~40%)
  - Code: `md:grid-rows-[3fr_2fr]` -- 60%/40% ratio correct. Unchanged.
- [x] Alle drei Zonen sind durch eine klare visuelle Trennung (Linie oder Abstand) voneinander abgegrenzt
  - Zone A and B use `rounded-xl border border-zinc-100 bg-white`. Zone C uses `border-dashed` (see BUG-6-1). Gaps maintained via `gap-4`.
- [x] Das Layout fuellt den sichtbaren Viewport aus (kein unnoetiges Scrollen auf Desktop 1280px+)
  - Code: `h-screen flex flex-col` on outer wrapper, `flex-1 min-h-0` on content area. Unchanged.
- [x] Auf Viewports < 768px (Mobile) wechselt das Layout in eine einspaltige Ansicht: Zone B -> Zone A -> Zone C
  - Code: `flex-col` default, `md:grid` for desktop; order-1 (B), order-2 (A), order-3 (C) on mobile. Unchanged.

#### AC-2: Zone A -- Kalender-Spalte

- [x] Zone A zeigt einen vertikalen Stunden-Raster von 6:00 bis 22:00 Uhr (17 Stunden)
  - Code: `START_HOUR = 6`, `END_HOUR = 22`, generates 17 hours. Unchanged.
- [x] Jede Stunde ist mit ihrer Uhrzeit beschriftet (z.B. "08:00")
  - Code: `formatHour()` pads with leading zero and appends ":00". Unchanged.
- [x] Die aktuelle Uhrzeit ist mit einer horizontalen Linie hervorgehoben (roter Strich)
  - Code: `bg-red-500` line with red dot. **Now uses pixel-based positioning** (`top: ${nowPositionPx}px`) instead of percentage, which is more accurate. Previous BUG-6 (now-line offset) appears FIXED.
- [ ] CHANGED: Zone A zeigt einen Text-Platzhalter: "Kalender folgt in MDP-4"
  - Previous status: PASS -- placeholder text was present in TimeGrid.tsx
  - Current status: The placeholder text "Kalender folgt in MDP-4" has been REMOVED as MDP-4 (CalendarWidget) is now integrated into Zone A. This is the expected behavior when MDP-4 is implemented. The AC is now obsolete. **PASS -- the AC was designed for the pre-MDP-4 state; Zone A now shows actual calendar content.**
- [x] Die Hoehe einer Stunden-Zeile entspricht visuell ca. einer Zeile
  - Code: `h-8` per hour row (2rem = 32px). Unchanged.

#### AC-3: Zone B -- Todos mit Zeitschaetzung

- [x] Die bestehende Todo-Liste (MDP-2) wird in Zone B eingebettet, Layout und Funktionalitaet bleiben erhalten
  - TodosZone wraps existing TodoItem components. Unchanged.
- [x] Jedes Todo-Element zeigt zusaetzlich eine Zeile mit Zeitschaetzungs-Bubbles
  - TimeEstimateBubbles rendered as children of each TodoItem. Unchanged.
- [x] Pro Todo werden 16 Bubbles angezeigt (= 4 Stunden in 15-Minuten-Schritten), angeordnet in 2 Reihen a 8
  - Code: `TOTAL_BUBBLES = 16`, `BUBBLES_PER_ROW = 8`. Unchanged.
- [x] Ein Klick auf eine Bubble fuellt alle Bubbles bis zu dieser Position (inklusive)
  - Code: `onEstimate(taskId, index + 1)`. Unchanged.
- [x] Ein erneuter Klick auf die bereits letzte ausgefuellte Bubble leert alle Bubbles (auf 0 zuruecksetzen)
  - Code: `if (index + 1 === filled) { onEstimate(taskId, 0); }`. Unchanged.
- [x] Ausgefuellte Bubbles werden visuell von leeren unterschieden (gefuellt = dunkel, leer = Outline)
  - Code: filled = `bg-zinc-700 border-zinc-600`, empty = `bg-transparent border-zinc-300`. Unchanged.
- [x] Unterhalb der Bubbles wird die geschaetzte Zeit in Textform angezeigt: "45 Min" oder "1 Std 30 Min"
  - Code: `formatEstimate()` function. Unchanged.
- [x] Die Zeitschaetzung wird nur im Browser-Memory gespeichert (kein Persist, kein localStorage im MVP)
  - Code: `useState` only in `useTimeEstimates.ts`. Unchanged.
- [x] Oberhalb der Todo-Liste wird die Summe aller Zeitschaetzungen angezeigt: "Heute geplant: X Std Y Min"
  - Code: EstimateSummary component. Unchanged.

#### AC-4: Zone C -- Notion-Platzhalter

- [x] Zone C zeigt einen klar abgegrenzten Bereich mit dem Platzhalter-Text "Notion-Seite folgt in MDP-5"
  - Code: `<p>Notion-Seite folgt in MDP-5</p>` in NotionZone.tsx. Unchanged.
- [ ] BUG: Der Bereich hat die gleiche Hintergrundfarbe/-struktur wie der Rest des Dashboards (kein auffaelliger Dummy-Rahmen)
  - STILL FAILING: NotionZone uses `border-dashed` styling. See BUG-6-1 (previously BUG-1).
- [x] Zone C ist in ihrer Hoehe proportional zum Viewport (ca. 35-40% der Seitengesamthoehe auf Desktop)
  - Code: `md:grid-rows-[3fr_2fr]` gives Zone C approximately 40%. Unchanged.

#### AC-5: Header / Navigation

- [x] Das Datum des heutigen Tages wird prominent oben auf der Seite angezeigt
  - Code: `Intl.DateTimeFormat('de-DE', ...)`. Unchanged.
- [x] Das Datum wird in deutscher Sprache ausgegeben
  - `de-DE` locale confirmed; `<html lang="de">` in layout.tsx. Unchanged.
- [x] Der bestehende "API-Key aendern"-Link bleibt erhalten, wird aber in eine unauffaellige Position (Icon) verschoben
  - Code: Settings gear icon in header. Unchanged.

---

### Edge Cases Status

#### EC-1: Nutzer schaetzt mehr als 16 Bubbles (>4h)
- [x] Handled correctly. Code: `Math.max(0, Math.min(16, bubbles))`. Unchanged.

#### EC-2: Summe aller Todos uebersteigt 8 Stunden
- [x] Handled correctly. Code: `OVERLOAD_THRESHOLD = 8 * 60`, red warning displayed. Unchanged.

#### EC-3: Keine Todos vorhanden
- [x] Handled correctly. Zone B shows "Keine Aufgaben fuer heute." and EstimateSummary shows "0 Min". Unchanged.

#### EC-4: Viewport 768px-1280px (Laptop 13")
- [x] Handled correctly. 2-column grid at `md:` breakpoint. Unchanged.

#### EC-5: Viewport < 768px
- [x] Handled correctly. `flex-col` with order-1 (B), order-2 (A), order-3 (C). Unchanged.

#### EC-6: Seite wird neu geladen
- [x] Handled correctly. `useState` only, no persistence. Unchanged.

#### EC-7: Zone A und Zone C leer (MDP-4/5 nicht gebaut)
- [x] UPDATED: Zone A is no longer empty -- CalendarWidget (MDP-4) now renders in Zone A with either ICS URL form or calendar events. Zone C still shows placeholder text. Layout proportions maintained.

---

### Cross-Feature Regression: MDP-1 (API-Key Konfiguration)

- [x] Eingabefeld vom Typ `password` vorhanden. Unchanged.
- [x] "Speichern"-Button vorhanden. Unchanged.
- [x] Key wird in localStorage unter `todoist_api_key` gespeichert. Unchanged.
- [x] Key bleibt ueber Browser-Refreshes erhalten. Unchanged.
- [x] Key wird gegen Todoist API validiert nach dem Speichern. (API v1 -- see BUG-6-2)
- [x] Bei erfolgreichem Key: Erfolgs-Feedback "Verbindung erfolgreich". Unchanged.
- [x] Bei ungueltigem Key (HTTP 401/403): Fehlermeldung korrekt. Unchanged.
- [x] Bei Netzwerkfehler: Fehlermeldung korrekt. Unchanged.
- [x] Ohne API-Key wird der Nutzer auf /setup weitergeleitet. Unchanged.
- [x] Link zur Todoist API-Key-Seite vorhanden und korrekt. Unchanged.
- [x] "Entfernen"-Button loescht Key aus localStorage. Unchanged.
- [x] localStorage-Verfuegbarkeit korrekt geprueft. Unchanged.

**Regression Status: NO REGRESSION. All MDP-1 functionality intact.**

---

### Cross-Feature Regression: MDP-2 (Heutige Todos anzeigen)

- [x] Todoist API wird beim Laden aufgerufen. Unchanged.
- [x] Erledigte Tasks werden gefiltert. Unchanged.
- [x] Tasks ohne `due` werden gefiltert. Unchanged.
- [x] "Aktualisieren"-Button vorhanden und funktional. Unchanged.
- [x] Jeder Task zeigt: Aufgabentitel, Projektname, Prioritaet. Unchanged.
- [x] Prioritaeten farblich unterschieden. Unchanged.
- [x] Liste nach Prioritaet sortiert. Unchanged.
- [x] Aufgaben mit Uhrzeit zeigen die Uhrzeit an. Unchanged.
- [x] Skeleton-Loader waehrend des Ladens. Unchanged.
- [x] Bei HTTP 401: Redirect zu /setup. Unchanged.
- [x] Bei Netzwerkfehler: Fehlermeldung mit Retry-Button. Unchanged.
- [x] Bei HTTP 5xx: Fehlermeldung. Unchanged.

**Regression Status: NO REGRESSION. All MDP-2 functionality intact.**
(Previously noted BUG-3 and BUG-4 about minor text deviations remain open but are unchanged.)

---

### Security Audit Results (Red Team Perspective)

All previous security findings from 2026-03-03 test remain unchanged. See MDP-4 QA results for new security findings related to the /api/calendar endpoint (SSRF vulnerability, no auth).

#### New Finding: connect-src CSP updated
- [x] PASS: CSP `connect-src` now includes `https://outlook.office365.com` in addition to `https://api.todoist.com`. However, since the ICS fetch now happens server-side via `/api/calendar`, the browser does not directly connect to Outlook. This is overly permissive but not a security risk.

---

### Bugs Status Update (from previous QA pass)

| Bug ID | Status | Notes |
|--------|--------|-------|
| BUG-1 (NotionZone border-dashed) | OPEN | Renumbered to BUG-6-1. Still present. |
| BUG-2 (API v1 vs v2) | OPEN | Renumbered to BUG-6-2. Still present. |
| BUG-3 (Empty state text) | OPEN | Renumbered to BUG-6-3. Still present. |
| BUG-4 (Heading "Todos" vs "Heute") | OPEN | Renumbered to BUG-6-4. Still present. |
| BUG-5 (Pagination not implemented) | OPEN | Renumbered to BUG-6-5. Still present. |
| BUG-6 (TimeGrid now-line position) | FIXED | TimeGrid now uses pixel positioning (`nowPositionPx = (currentTime - START_HOUR) * ROW_HEIGHT`) instead of percentage. The now-line is positioned within the grid container using absolute pixel offset, which correctly aligns with the hour rows. |
| SEC-1 (API key plaintext) | OPEN | Accepted risk. |
| SEC-2 (CSP unsafe-eval) | OPEN | Still present. |
| SEC-3 (No rate limiting) | OPEN | Accepted risk. |

---

### Remaining Bugs (MDP-6 scope only)

#### BUG-6-1: NotionZone verwendet border-dashed (auffaelliger Dummy-Rahmen)
- **Severity:** Low
- **Steps to Reproduce:** See previous BUG-1. Unchanged.
- **Priority:** Nice to have

#### BUG-6-2: API-Endpunkt weicht von Spec ab (v1 statt v2)
- **Severity:** Medium
- **Steps to Reproduce:** See previous BUG-2. Unchanged.
- **Priority:** Fix before deployment

#### BUG-6-3: Leerer Zustand -- fehlender Emoji-Text
- **Severity:** Low
- **Steps to Reproduce:** See previous BUG-3. Unchanged.
- **Priority:** Nice to have

#### BUG-6-4: Ueberschrift zeigt "Todos" statt "Heute"
- **Severity:** Low
- **Steps to Reproduce:** See previous BUG-4. Unchanged.
- **Priority:** Nice to have

#### BUG-6-5: Todoist API Paginierung nicht vollstaendig implementiert
- **Severity:** High
- **Steps to Reproduce:** See previous BUG-5. Unchanged.
- **Priority:** Fix before deployment

#### EDGE-6-1: formatTime uses browser default locale instead of de-DE
- **Severity:** Low
- **Steps to Reproduce:** See previous EDGE-1. Unchanged.
- **Priority:** Fix in next sprint

---

### Summary

- **Acceptance Criteria (MDP-6):** 21/22 passed (1 Low severity failure -- NotionZone border style)
- **Previously reported BUG-6 (now-line offset):** FIXED by MDP-4 integration (pixel-based positioning)
- **Cross-Feature MDP-1:** NO REGRESSION (all criteria still pass)
- **Cross-Feature MDP-2:** NO REGRESSION (previously noted text deviations still open)
- **Bugs (MDP-6 scope):** 5 remaining (0 Critical, 1 High, 1 Medium, 3 Low)
  - High: BUG-6-5 (pagination not implemented)
  - Medium: BUG-6-2 (API version mismatch)
  - Low: BUG-6-1 (NotionZone border), BUG-6-3 (empty state text), BUG-6-4 (heading text)
- **New Security Findings:** See MDP-4 QA results for critical SSRF vulnerability in /api/calendar
- **Build:** PASS (compiles without errors)
- **Lint:** FAIL (1 error from MDP-4 CalendarWidget -- not in MDP-6 scope)
- **Production Ready (MDP-6 alone):** NO -- BUG-6-5 (pagination) is High severity. Additionally, the MDP-4 integration introduces Critical security issues that affect the overall app.
- **Recommendation:** Fix BUG-6-5 (pagination) and BUG-6-2 (verify API version) for MDP-6. Address MDP-4 SSRF and auth issues before any deployment.

## Deployment
_To be added by /deploy_
