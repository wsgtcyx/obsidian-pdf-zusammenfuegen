import { basename } from "node:path";

import { App, ButtonComponent, Modal, Setting } from "obsidian";

export class OrderPdfModal extends Modal {
  private readonly onSubmit: (orderedPaths: string[] | null) => void;
  private readonly items: string[];

  constructor(app: App, inputPaths: string[], onSubmit: (orderedPaths: string[] | null) => void) {
    super(app);
    this.items = [...inputPaths];
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("pdfzus-merge-modal");

    new Setting(contentEl).setName("Reihenfolge prüfen").setHeading();
    contentEl.createEl("p", {
      cls: "pdfzus-help-text",
      text: "Prüfen Sie die Reihenfolge, bevor Sie alles zusammenführen. Die erste Datei landet vorne im Ergebnis."
    });

    const listEl = contentEl.createDiv({ cls: "pdfzus-file-list" });
    const actionSetting = new Setting(contentEl);

    const render = (): void => {
      listEl.empty();

      this.items.forEach((filePath, index) => {
        const rowEl = listEl.createDiv({ cls: "pdfzus-file-row" });
        const metaEl = rowEl.createDiv();
        metaEl.createDiv({ cls: "pdfzus-file-name", text: `${index + 1}. ${basename(filePath)}` });
        metaEl.createDiv({ cls: "pdfzus-file-path", text: filePath });

        const actionsEl = rowEl.createDiv({ cls: "pdfzus-file-actions" });

        const upButton = new ButtonComponent(actionsEl);
        upButton.setButtonText("Nach oben");
        upButton.setDisabled(index === 0);
        upButton.onClick(() => {
          this.move(index, index - 1);
          render();
        });

        const downButton = new ButtonComponent(actionsEl);
        downButton.setButtonText("Nach unten");
        downButton.setDisabled(index === this.items.length - 1);
        downButton.onClick(() => {
          this.move(index, index + 1);
          render();
        });
      });
    };

    actionSetting.addButton((button: ButtonComponent) => {
      button.setButtonText("Abbrechen");
      button.onClick(() => this.closeWith(null));
    });
    actionSetting.addButton((button: ButtonComponent) => {
      button.setButtonText("Weiter");
      button.setCta();
      button.onClick(() => this.closeWith([...this.items]));
    });

    render();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private move(fromIndex: number, toIndex: number): void {
    if (toIndex < 0 || toIndex >= this.items.length) {
      return;
    }

    const [item] = this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, item);
  }

  private closeWith(orderedPaths: string[] | null): void {
    this.onSubmit(orderedPaths);
    this.close();
  }
}
