# PRD — MyDayPlaner

## Vision

MyDayPlaner ist ein privates Tages-Dashboard für den persönlichen Gebrauch.
Es gibt mir morgens auf einen Blick alles, was heute wichtig ist — beginnend mit meinen Todoist-Aufgaben.
Die App wächst schrittweise: nach Todos kommen Kalender und Notion-Inhalte dazu.

---

## Target Users

| Persona | Beschreibung | Pain Point |
|---------|-------------|-----------|
| Ich (Entwickler) | Privatperson, nutzt Todoist aktiv für Tagesplanung | Muss mehrere Apps öffnen, um den Tag zu überblicken |

**Kein Multi-User, kein Login, kein Backend-Account-System.**

---

## Core Features — Roadmap

| ID | Feature | Priorität | Status |
|----|---------|-----------|--------|
| MDP-1 | Todoist API-Key Konfiguration | P0 — MVP | Planned |
| MDP-2 | Heutige Todos anzeigen | P0 — MVP | Planned |
| MDP-3 | Todos als erledigt markieren | P1 — Next | Planned |
| MDP-4 | Office 365 Calendar Integration | P1 — Next | Planned |
| MDP-5 | Notion-Seite einbinden | P2 — Later | Planned |

---

## Success Metrics

- Ich öffne MyDayPlaner morgens als erstes und sehe sofort alle heutigen Todos
- Kein manuelles Öffnen von Todoist nötig, um den Tag zu planen
- Ladezeit der Todos < 2 Sekunden

---

## Constraints

- **Kein Backend** — Kein eigener Server, keine Datenbank; alles läuft im Browser/Client
- **Kein Login-System** — Single-User, API-Key wird lokal im Browser gespeichert
- **Schnelles MVP** — MDP-1 + MDP-2 so schnell wie möglich lauffähig
- **Tech Stack** — Next.js 16, TypeScript, Tailwind CSS (bereits aufgesetzt)

---

## Non-Goals

- Todos erstellen, bearbeiten oder löschen
- Benachrichtigungen / Reminder
- Mobile App (PWA ist später denkbar, aber kein MVP-Ziel)
- Mehrere Nutzer oder Sharing-Funktionen
- Eigene Benutzerverwaltung / Accounts
