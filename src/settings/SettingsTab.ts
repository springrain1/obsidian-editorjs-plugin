import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsidianEditorJSPlugin from '../main';
import { t, getAvailableLanguages } from '../i18n';

/**
 * Settings tab for the Editor.js plugin
 * Provides UI for users to configure plugin options
 */
export class EditorJSSettingTab extends PluginSettingTab {
  plugin: ObsidianEditorJSPlugin;

  constructor(app: App, plugin: ObsidianEditorJSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Display the settings tab
   */
  display(): void {
    const { containerEl } = this;
    const translations = t(this.plugin.settings.language);

    containerEl.empty();

    // Header
    containerEl.createEl('h2', { text: translations.settingsTitle });

    // Language setting (at the top for easy access)
    new Setting(containerEl)
      .setName(translations.language)
      .setDesc(translations.languageDesc)
      .addDropdown(dropdown => {
        const languages = getAvailableLanguages();
        languages.forEach(lang => {
          dropdown.addOption(lang.value, lang.label);
        });
        dropdown
          .setValue(this.plugin.settings.language)
          .onChange(async (value: string) => {
            this.plugin.settings.language = value as any;
            await this.plugin.saveSettings();
            // Refresh the settings display immediately
            this.display();
            // Notify user
            this.plugin.refreshUI();
          });
      });

    // Auto-save interval setting
    new Setting(containerEl)
      .setName(translations.autoSaveInterval)
      .setDesc(translations.autoSaveIntervalDesc)
      .addText(text => text
        .setPlaceholder('30')
        .setValue(String(this.plugin.settings.autoSaveInterval / 1000))
        .onChange(async (value) => {
          const seconds = parseInt(value);
          if (!isNaN(seconds) && seconds >= 0) {
            this.plugin.settings.autoSaveInterval = seconds * 1000;
            await this.plugin.saveSettings();
          }
        }));

    // Image folder setting
    new Setting(containerEl)
      .setName(translations.imageFolder)
      .setDesc(translations.imageFolderDesc)
      .addText(text => text
        .setPlaceholder('attachments')
        .setValue(this.plugin.settings.imageFolder)
        .onChange(async (value) => {
          this.plugin.settings.imageFolder = value;
          await this.plugin.saveSettings();
        }));

    // Default view mode setting
    new Setting(containerEl)
      .setName(translations.defaultViewMode)
      .setDesc(translations.defaultViewModeDesc)
      .addDropdown(dropdown => dropdown
        .addOption('markdown', translations.markdown)
        .addOption('editorjs', translations.richText)
        .setValue(this.plugin.settings.defaultViewMode)
        .onChange(async (value: string) => {
          this.plugin.settings.defaultViewMode = value as 'markdown' | 'editorjs';
          await this.plugin.saveSettings();
        }));

    // Theme setting
    new Setting(containerEl)
      .setName(translations.editorTheme)
      .setDesc(translations.editorThemeDesc)
      .addDropdown(dropdown => dropdown
        .addOption('auto', translations.auto)
        .addOption('light', translations.light)
        .addOption('dark', translations.dark)
        .setValue(this.plugin.settings.theme)
        .onChange(async (value: string) => {
          this.plugin.settings.theme = value as 'light' | 'dark' | 'auto';
          await this.plugin.saveSettings();
          // Apply theme immediately to all open editors
          this.plugin.refreshUI();
        }));

    // Enable backup setting
    new Setting(containerEl)
      .setName(translations.enableBackup)
      .setDesc(translations.enableBackupDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableBackup)
        .onChange(async (value) => {
          this.plugin.settings.enableBackup = value;
          await this.plugin.saveSettings();
        }));

    // Virtual scrolling setting
    new Setting(containerEl)
      .setName(translations.enableVirtualScrolling)
      .setDesc(translations.enableVirtualScrollingDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableVirtualScrolling)
        .onChange(async (value) => {
          this.plugin.settings.enableVirtualScrolling = value;
          await this.plugin.saveSettings();
        }));

    // Virtual scrolling threshold
    new Setting(containerEl)
      .setName(translations.virtualScrollThreshold)
      .setDesc(translations.virtualScrollThresholdDesc)
      .addText(text => text
        .setPlaceholder('500')
        .setValue(String(this.plugin.settings.virtualScrollThreshold))
        .onChange(async (value) => {
          const threshold = parseInt(value);
          if (!isNaN(threshold) && threshold > 0) {
            this.plugin.settings.virtualScrollThreshold = threshold;
            await this.plugin.saveSettings();
          }
        }));

    // Enabled tools section
    containerEl.createEl('h3', { text: translations.enabledTools });
    containerEl.createEl('p', { 
      text: translations.enabledToolsDesc,
      cls: 'setting-item-description'
    });

    const availableTools = [
      { id: 'header', name: translations.header },
      { id: 'paragraph', name: translations.paragraph },
      { id: 'list', name: translations.list },
      { id: 'checklist', name: translations.checklist },
      { id: 'table', name: translations.table },
      { id: 'image', name: translations.image },
      { id: 'simpleImage', name: translations.simpleImage },
      { id: 'code', name: translations.code },
      { id: 'quote', name: translations.quote },
      { id: 'delimiter', name: translations.delimiter },
      { id: 'warning', name: translations.warning },
      { id: 'raw', name: translations.raw },
      { id: 'embed', name: translations.embed },
      { id: 'linkTool', name: translations.linkTool },
      { id: 'attaches', name: translations.attaches }
    ];

    availableTools.forEach(tool => {
      new Setting(containerEl)
        .setName(tool.name)
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enabledTools.includes(tool.id))
          .onChange(async (value) => {
            if (value) {
              if (!this.plugin.settings.enabledTools.includes(tool.id)) {
                this.plugin.settings.enabledTools.push(tool.id);
              }
            } else {
              this.plugin.settings.enabledTools = 
                this.plugin.settings.enabledTools.filter(t => t !== tool.id);
            }
            await this.plugin.saveSettings();
            // Refresh all open editors to apply tool changes
            this.plugin.refreshUI();
          }));
    });
  }
}
