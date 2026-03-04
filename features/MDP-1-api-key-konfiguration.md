# MDP-1 — Todoist API-Key Konfiguration

**Status:** Planned
**Priorität:** P0 — MVP
**Abhängigkeiten:** keine

---

## Zusammenfassung

Der Nutzer kann seinen Todoist API-Key in der App hinterlegen, damit die App im Namen des Nutzers auf die Todoist-API zugreifen kann. Der Key wird lokal im Browser gespeichert (localStorage) — es gibt keinen eigenen Backend-Server.

---

## User Stories

| # | Als ... | möchte ich ... | damit ... |
|---|---------|---------------|-----------|
| 1 | Nutzer | meinen Todoist API-Key eintragen können | die App auf meine Todos zugreift |
| 2 | Nutzer | sehen, ob mein API-Key gültig ist | ich weiß, dass die Verbindung funktioniert |
| 3 | Nutzer | meinen API-Key jederzeit ändern oder löschen können | ich die Kontrolle über meinen Zugang behalte |
| 4 | Nutzer | beim ersten Öffnen der App direkt zur Konfiguration geleitet werden | ich weiß, wo ich anfangen soll |
| 5 | Nutzer | den API-Key als Passwortfeld (verdeckt) eingeben können | er nicht versehentlich sichtbar ist |

---

## Acceptance Criteria

### Eingabe & Speicherung
- [ ] Es gibt ein Eingabefeld für den API-Key (Typ `password`, verdeckte Darstellung)
- [ ] Der Nutzer kann den Key per Button "Speichern" bestätigen
- [ ] Der Key wird in `localStorage` unter dem Schlüssel `todoist_api_key` gespeichert
- [ ] Nach dem Speichern bleibt der Key über Browser-Refreshes hinweg erhalten

### Validierung
- [ ] Nach dem Speichern wird der Key sofort gegen die Todoist API validiert (`GET /rest/v2/projects`)
- [ ] Bei erfolgreichem Key: Erfolgs-Feedback ("Verbindung erfolgreich ✓")
- [ ] Bei ungültigem Key (HTTP 401/403): Fehlermeldung ("API-Key ungültig. Bitte prüfe deinen Key.")
- [ ] Bei Netzwerkfehler: Fehlermeldung ("Keine Verbindung. Bitte prüfe deine Internetverbindung.")

### Erster Aufruf (Onboarding)
- [ ] Ist kein API-Key vorhanden, wird der Nutzer auf die Konfigurationsseite weitergeleitet (oder ein Modal gezeigt)
- [ ] Die Seite enthält einen klickbaren Link zur Todoist API-Key-Seite: `https://app.todoist.com/app/settings/integrations/developer`

### Key verwalten
- [ ] Es gibt einen "Entfernen"-Button, der den Key aus localStorage löscht
- [ ] Nach dem Entfernen wird der Nutzer wieder zur Konfigurationsseite/Modal geleitet

---

## Edge Cases

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| Nutzer gibt leeren String ein und klickt Speichern | Validierung verhindert API-Call; Hinweis "Bitte gib einen API-Key ein" |
| Nutzer gibt Key mit Leerzeichen vorne/hinten ein | Key wird vor dem Speichern getrimmt (`trim()`) |
| API-Key ist gespeichert, aber Todoist ändert das Token (z. B. nach Reset) | Beim nächsten Laden der Todos erscheint Fehler 401 → Nutzer wird zur Konfiguration weitergeleitet |
| localStorage nicht verfügbar (z. B. Private-Mode einiger Browser) | Fehlermeldung: "Dein Browser erlaubt keine lokale Speicherung. Bitte deaktiviere den Privacy-Modus." |
| Nutzer öffnet App im Inkognito-Modus | Key wird nicht dauerhaft gespeichert; Hinweis darauf in der UI |

---

## Out of Scope

- OAuth / "Login mit Todoist"
- Verschlüsselung des Keys im localStorage (kein Mehrbenutzerbetrieb)
- Key-Rotation oder automatische Erneuerung

---

## QA Test Results

**Tested:** 2026-03-03 (as part of MDP-6 regression testing)
**Tester:** QA Engineer (AI)

### Summary
- **Acceptance Criteria:** 12/12 passed
- **Bugs:** 1 Medium (API endpoint uses v1 instead of REST v2 as specified -- see MDP-6 BUG-2)
- **Full results:** See `features/MDP-6-dashboard-layout.md` QA section, "Cross-Feature Regression: MDP-1"
