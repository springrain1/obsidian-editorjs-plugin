import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsidianEditorJSPlugin from '../main';

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

    containerEl.empty();

    // Header
    containerEl.createEl('h2', { text: 'Editor.js Plugin Settings' });

    // Auto-save interval setting
    new Setting(containerEl)
      .setName('Auto-save interval')
      .setDesc('Time in seconds between automatic saves (0 to disable)')
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
      .setName('Image folder')
      .setDesc('Folder path for storing uploaded images')
      .addText(text => text
        .setPlaceholder('attachments')
        .setValue(this.plugin.settings.imageFolder)
        .onChange(async (value) => {
          this.plugin.settings.imageFolder = value;
          await this.plugin.saveSettings();
        }));

    // Default view mode setting
    new Setting(containerEl)
      .setName('Default view mode')
      .setDesc('Default editor mode when opening files')
      .addDropdown(dropdown => dropdown
        .addOption('markdown', 'Markdown')
        .addOption('editorjs', 'Rich Text (Editor.js)')
        .setValue(this.plugin.settings.defaultViewMode)
        .onChange(async (value: string) => {
          this.plugin.settings.defaultViewMode = value as 'markdown' | 'editorjs';
          await this.plugin.saveSettings();
        }));

    // Theme setting
    new Setting(containerEl)
      .setName('Editor theme')
      .setDesc('Theme for the Editor.js interface')
      .addDropdown(dropdown => dropdown
        .addOption('auto', 'Auto (follow Obsidian)')
        .addOption('light', 'Light')
        .addOption('dark', 'Dark')
        .setValue(this.plugin.settings.theme)
        .onChange(async (value: string) => {
          this.plugin.settings.theme = value as 'light' | 'dark' | 'auto';
          await this.plugin.saveSettings();
        }));

    // Enable backup setting
    new Setting(containerEl)
      .setName('Enable backup')
      .setDesc('Create automatic backups before saving')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableBackup)
        .onChange(async (value) => {
          this.plugin.settings.enableBackup = value;
          await this.plugin.saveSettings();
        }));

    // Virtual scrolling setting
    new Setting(containerEl)
      .setName('Enable virtual scrolling')
      .setDesc('Improve performance for large documents')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableVirtualScrolling)
        .onChange(async (value) => {
          this.plugin.settings.enableVirtualScrolling = value;
          await this.plugin.saveSettings();
        }));

    // Virtual scrolling threshold
    new Setting(containerEl)
      .setName('Virtual scrolling threshold')
      .setDesc('Number of blocks before virtual scrolling activates')
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
    containerEl.createEl('h3', { text: 'Enabled Tools' });
    containerEl.createEl('p', { 
      text: 'Select which Editor.js tools to enable',
      cls: 'setting-item-description'
    });

    const availableTools = [
      { id: 'header', name: 'Header' },
      { id: 'paragraph', name: 'Paragraph' },
      { id: 'list', name: 'List' },
      { id: 'checklist', name: 'Checklist' },
      { id: 'table', name: 'Table' },
      { id: 'image', name: 'Image' },
      { id: 'code', name: 'Code' },
      { id: 'quote', name: 'Quote' }
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
          }));
    });
  }
}
