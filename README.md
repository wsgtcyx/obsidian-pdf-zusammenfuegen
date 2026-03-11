# PDF Zusammenfügen - pdfzus

**PDF Zusammenfügen - pdfzus** fügt mehrere PDF-Dateien direkt in Obsidian lokal zusammen. Die Dateien werden nur von Ihrem Gerät gelesen und das Ergebnis ebenfalls lokal gespeichert. Es gibt keine Uploads, kein Konto und keine Telemetrie.

Die offizielle Produktseite finden Sie unter [pdfzus.de](https://pdfzus.de/).

## Funktionen

- Mehrere PDF-Dateien von Ihrem Desktop auswählen
- Reihenfolge vor dem Zusammenfügen in einer Obsidian-Ansicht anpassen
- Ergebnis lokal als neue PDF-Datei speichern
- Fehler bei ungültigen oder beschädigten PDFs verständlich anzeigen
- Keine Netzwerkaufrufe während des Zusammenfügens

## So funktioniert es

1. Öffnen Sie die Befehlspalette in Obsidian.
2. Starten Sie den Befehl `PDF-Dateien zusammenfügen`.
3. Wählen Sie mindestens zwei PDF-Dateien auf Ihrem Rechner aus.
4. Prüfen und sortieren Sie die Reihenfolge im Dialog.
5. Wählen Sie den Zielpfad für die neue Datei.
6. Die zusammengeführte PDF wird lokal geschrieben.

## Datenschutz

- Die Plugin-Funktion greift auf PDF-Dateien außerhalb Ihres Vaults zu, wenn Sie diese im Systemdialog auswählen.
- Diese Dateien werden ausschließlich lokal gelesen und lokal geschrieben.
- Es werden keine Inhalte an `pdfzus.de` oder andere Server übertragen.
- Es gibt keine Analyse-, Tracking- oder Telemetriedaten.

## Voraussetzungen

- Obsidian Desktop
- Obsidian `1.8.0` oder neuer

## Entwicklung

```bash
pnpm install
pnpm build
pnpm test
pnpm package:artifacts
```

Die Release-Dateien landen danach in `artifacts/release/`.

## Support

- Website: [https://pdfzus.de/](https://pdfzus.de/)
- Datenschutz: [https://pdfzus.de/privacy-policy](https://pdfzus.de/privacy-policy)
- E-Mail: [support2@pdfzus.de](mailto:support2@pdfzus.de)

## Lizenz

MIT
