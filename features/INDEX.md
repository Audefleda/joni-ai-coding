# Features — Index

**Projekt:** MyDayPlaner
**Next Available ID:** MDP-7

---

## Status-Legende

| Status | Bedeutung |
|--------|-----------|
| Planned | Spec vorhanden, noch nicht begonnen |
| In Progress | Wird gerade gebaut |
| Done | Implementiert & getestet |

---

## Feature-Übersicht

| ID | Feature | Priorität | Status | Spec |
|----|---------|-----------|--------|------|
| MDP-1 | Todoist API-Key Konfiguration | P0 — MVP | Planned | [MDP-1-api-key-konfiguration.md](MDP-1-api-key-konfiguration.md) |
| MDP-2 | Heutige Todos anzeigen | P0 — MVP | Planned | [MDP-2-heutige-todos-anzeigen.md](MDP-2-heutige-todos-anzeigen.md) |
| MDP-3 | Todos als erledigt markieren | P1 — Next | Planned | — |
| MDP-4 | Office 365 Calendar Integration | P1 — Next | In Review | [MDP-4-office365-calendar-integration.md](MDP-4-office365-calendar-integration.md) |
| MDP-5 | Notion-Seite einbinden | P2 — Later | Planned | — |
| MDP-6 | Dashboard Layout (3-Zonen-Struktur) | P0 — MVP | In Review | [MDP-6-dashboard-layout.md](MDP-6-dashboard-layout.md) |

---

## Empfohlene Build-Reihenfolge

1. **MDP-1** — API-Key Konfiguration *(Voraussetzung für alles andere)*
2. **MDP-2** — Heutige Todos anzeigen *(Kern-MVP)*
3. **MDP-6** — Dashboard Layout *(struktureller Rahmen für alle weiteren Features)*
4. **MDP-3** — Todos abhaken *(erweitert MDP-2)*
5. **MDP-4** — Kalender *(füllt Zone A aus MDP-6)*
6. **MDP-5** — Notion *(füllt Zone C aus MDP-6)*
