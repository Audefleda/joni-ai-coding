# MDP-2 — Heutige Todos anzeigen

**Status:** Planned
**Priorität:** P0 — MVP
**Abhängigkeiten:** MDP-1 (API-Key muss gespeichert und gültig sein)

---

## Zusammenfassung

Die Hauptseite der App zeigt eine Liste aller Todoist-Aufgaben, die für den heutigen Tag fällig sind (`due_date = heute`). Die Liste wird beim Laden der Seite automatisch abgerufen. Der Nutzer sieht Tasks aus allen Projekten, sortiert nach Priorität.

---

## User Stories

| # | Als ... | möchte ich ... | damit ... |
|---|---------|---------------|-----------|
| 1 | Nutzer | beim Öffnen der App sofort meine heutigen Todos sehen | ich meinen Tag ohne Umwege planen kann |
| 2 | Nutzer | die Todos nach Priorität sortiert sehen | ich weiß, womit ich anfangen soll |
| 3 | Nutzer | das Projekt jedes Todos sehen | ich den Kontext der Aufgabe verstehe |
| 4 | Nutzer | die Liste manuell aktualisieren können | ich neu hinzugefügte Todos sehe |
| 5 | Nutzer | eine klare Meldung sehen, wenn ich keine Todos für heute habe | ich nicht denke, die App funktioniert nicht |

---

## Acceptance Criteria

### Datenabruf
- [ ] Beim Laden der Seite wird die Todoist REST API v2 aufgerufen: `GET /rest/v2/tasks?filter=today`
- [ ] Nur Tasks mit `due.date = heutiges Datum (ISO 8601)` werden angezeigt
- [ ] Erledigte Tasks (`is_completed: true`) werden nicht angezeigt
- [ ] Es gibt einen "Aktualisieren"-Button (oder Pull-to-Refresh), der die Liste neu lädt

### Darstellung der Liste
- [ ] Jeder Task zeigt: **Aufgabentitel** (fett), **Projektname**, **Priorität** (farbige Markierung)
- [ ] Prioritäten werden farblich unterschieden: P1 = Rot, P2 = Orange, P3 = Blau, P4 = Grau (kein Priorität)
- [ ] Die Liste ist nach Priorität sortiert (P1 oben, P4 unten); bei gleicher Priorität alphabetisch
- [ ] Aufgaben mit Uhrzeit (`due.datetime` vorhanden) zeigen zusätzlich die Uhrzeit an

### Leere & Ladezustände
- [ ] Während des Ladens wird ein Skeleton-Loader oder Spinner angezeigt
- [ ] Wenn keine Todos für heute vorhanden sind: Nachricht "Keine Aufgaben für heute. Genieß den Tag! 🎉"
- [ ] Die Anzahl der Todos wird in der Überschrift angezeigt, z. B. "Heute (5)"

### Fehlerbehandlung
- [ ] Bei HTTP 401: Nutzer wird zur API-Key-Konfiguration (MDP-1) weitergeleitet mit Hinweis "API-Key ungültig"
- [ ] Bei Netzwerkfehler: Fehlermeldung mit Retry-Button "Erneut versuchen"
- [ ] Bei HTTP 5xx (Todoist-Ausfall): Fehlermeldung "Todoist ist gerade nicht erreichbar. Bitte später versuchen."

---

## Edge Cases

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| Nutzer hat 50+ Todos heute | Alle werden angezeigt; kein Paging nötig im MVP (Scroll reicht) |
| Todo-Titel ist sehr lang (>100 Zeichen) | Text bricht um, kein Overflow; kein Truncating im MVP |
| Todo hat kein Projekt (Inbox) | Projektname zeigt "Inbox" |
| Todo hat ein Unterprojekt | Vollständiger Projektpfad wird angezeigt, z. B. "Arbeit > Meetings" |
| Kein API-Key vorhanden (MDP-1 nicht abgeschlossen) | Nutzer wird zu MDP-1-Konfiguration weitergeleitet, bevor API-Call gemacht wird |
| Todoist API gibt leere `due`-Felder zurück | Tasks ohne Fälligkeitsdatum werden ignoriert (nicht angezeigt) |
| Zeitzone-Diskrepanz (Nutzer in anderer Zeitzone als UTC) | "Heute" wird anhand der lokalen Browserzeit des Nutzers bestimmt |

---

## Out of Scope

- Todos erstellen, bearbeiten oder löschen
- Todos als erledigt markieren (→ MDP-3)
- Anzeige von überfälligen Todos aus Vortagen
- Filterung nach Projekten oder Labels
- Offline-Modus / Caching

---

## QA Test Results

**Tested:** 2026-03-03 (as part of MDP-6 regression testing)
**Tester:** QA Engineer (AI)

### Summary
- **Acceptance Criteria:** 10/12 passed
- **Bugs:**
  - 1 High: Pagination not implemented -- only first page of results fetched (see MDP-6 BUG-5)
  - 1 Medium: API endpoint uses v1 Sync API instead of REST v2 as specified (see MDP-6 BUG-2)
  - 2 Low: Empty state missing emoji text (BUG-3), heading shows "Todos" instead of "Heute" (BUG-4)
- **Full results:** See `features/MDP-6-dashboard-layout.md` QA section, "Cross-Feature Regression: MDP-2"
