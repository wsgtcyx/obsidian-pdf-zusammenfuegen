import { App, ButtonComponent, Modal, Setting, TextComponent } from "obsidian";

export class SaveTargetModal extends Modal {
  private readonly defaultPath: string;
  private readonly onSubmit: (value: string | null) => void;
  private currentValue: string;

  constructor(app: App, defaultPath: string, onSubmit: (value: string | null) => void) {
    super(app);
    this.defaultPath = defaultPath;
    this.currentValue = defaultPath;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("pdfzus-merge-modal");

    new Setting(contentEl).setName("Speicherort wählen").setHeading();
    contentEl.createEl("p", {
      cls: "pdfzus-help-text",
      text: "Bitte hier eingeben, wo gespeichert werden soll."
    });

    const pathSetting = new Setting(contentEl).setName("Dateipfad");
    pathSetting.addText((text: TextComponent) => {
      text.setPlaceholder(this.defaultPath);
      text.setValue(this.defaultPath);
      text.onChange((value) => {
        this.currentValue = value.trim();
      });
      text.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          this.submit();
        }
      });
      return text;
    });

    const actionSetting = new Setting(contentEl);
    actionSetting.addButton((button: ButtonComponent) => {
      button.setButtonText("Abbrechen");
      button.onClick(() => this.closeWith(null));
    });
    actionSetting.addButton((button: ButtonComponent) => {
      button.setButtonText("Speichern");
      button.setCta();
      button.onClick(() => this.submit());
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private submit(): void {
    const value = this.currentValue || this.defaultPath;
    this.closeWith(value);
  }

  private closeWith(value: string | null): void {
    this.onSubmit(value);
    this.close();
  }
}
