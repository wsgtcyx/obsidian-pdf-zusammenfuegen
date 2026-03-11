# Veröffentlichung auf GitHub, Obsidian Community Plugins, Forum und Hub

## 1. Lokale Prüfung

```bash
cd reference-repos/obsidian-pdf-zusammenfuegen
pnpm install
pnpm check
pnpm package:artifacts
```

Vor dem Release prüfen:

- `manifest.json` und `versions.json` haben dieselbe Version
- `manifest.json` und der Community-Plugins-Eintrag verwenden exakt dieselbe Beschreibung
- `main.js`, `manifest.json` und `styles.css` liegen im Projektwurzelverzeichnis vor
- `artifacts/release/` enthält die Release-Dateien

## 2. GitHub-Repository vorbereiten

Repository-Ziel:

- Account: `wsgtcyx`
- Repo: `obsidian-pdf-zusammenfuegen`

Empfohlene About-Daten auf GitHub:

- Description: `Mehrere PDF-Dateien lokal zusammenfügen. Ohne Upload, ohne Anmeldung und ohne Telemetrie.`
- Website: `https://pdfzus.de/`

## 3. Release erstellen

Wichtig:

- Das Tag muss exakt `0.1.0` heißen, ohne Präfix `v`
- Upload als einzelne Dateien:
  - `main.js`
  - `manifest.json`
  - `styles.css`

CLI-Beispiel:

```bash
gh release create 0.1.0 main.js manifest.json styles.css \
  --title "0.1.0" \
  --notes "Erstes Release von PDF Zusammenfügen - pdfzus für Obsidian."
```

## 4. Community-Plugin-PR einreichen

In `obsidianmd/obsidian-releases` wird `community-plugins.json` ergänzt:

```json
{
  "id": "pdfzus-merge-pdf",
  "name": "PDF Zusammenfügen - pdfzus",
  "author": "pdfzus",
  "description": "Mehrere PDF-Dateien lokal zusammenfügen. Ohne Upload, ohne Anmeldung und ohne Telemetrie.",
  "repo": "wsgtcyx/obsidian-pdf-zusammenfuegen"
}
```

Wichtige Regeln:

- Beschreibung muss exakt mit `manifest.json` übereinstimmen
- PR-Titel: `Add plugin: PDF Zusammenfügen - pdfzus`
- Kein neues PR bei Fehlern eröffnen, sondern dasselbe PR aktualisieren

## 5. Forum-Showcase

Empfohlener Bereich:

- `https://forum.obsidian.md/c/share-showcase/9`

Kurzaufbau für den Post:

- Was das Plugin macht
- Datenschutz und lokaler Workflow
- GitHub-Link
- Link zur offiziellen Website `https://pdfzus.de/`

## 6. Obsidian Hub

Ziel:

- Eine Plugin-Seite oder Ergänzung mit Repo-Link und Website-Link

Empfohlene Inhalte:

- Name des Plugins
- GitHub-Repository
- Offizielle Website
- Kurzbeschreibung
- Datenschutz-Hinweis
