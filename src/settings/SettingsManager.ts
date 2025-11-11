import ObsidianEditorJSPlugin from '../main';
import { Language } from '../i18n';

/**
 * Plugin settings interface
 * Defines all configurable options for the plugin
 */
export interface PluginSettings {
  /** Auto-save interval in milliseconds */
  autoSaveInterval: number;
  
  /** List of enabled Editor.js tools */
  enabledTools: string[];
  
  /** Folder path for storing images */
  imageFolder: string;
  
  /** Default view mode when opening files */
  defaultViewMode: 'markdown' | 'editorjs';
  
  /** Enable virtual scrolling for large documents */
  enableVirtualScrolling: boolean;
  
  /** Number of blocks threshold for virtual scrolling */
  virtualScrollThreshold: number;
  
  /** Enable automatic backup before saving */
  enableBackup: boolean;
  
  /** Theme preference */
  theme: 'light' | 'dark' | 'auto';
  
  /** Interface language */
  language: Language;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  autoSaveInterval: 30000, // 30 seconds
  enabledTools: [
    'header',
    'paragraph',
    'list',
    'checklist',
    'table',
    'image',
    'code',
    'quote',
    'delimiter',
    'warning',
    'raw',
    'embed',
    'linkTool',
    'attaches',
    'simpleImage',
    'alert',
    'button',
    'tooltip',
    'personality',
    'footnotes',
    'toggle',
    'math',
    'layout',
    'alignment',
    'style',
    'textVariant'
  ],
  imageFolder: 'attachments',
  defaultViewMode: 'markdown',
  enableVirtualScrolling: true,
  virtualScrollThreshold: 500,
  enableBackup: true,
  theme: 'auto',
  language: 'zh-CN'
};

/**
 * Settings manager class
 * Handles loading and saving plugin settings
 */
export class SettingsManager {
  private plugin: ObsidianEditorJSPlugin;

  constructor(plugin: ObsidianEditorJSPlugin) {
    this.plugin = plugin;
  }

  /**
   * Load settings from disk
   * Merges saved settings with defaults
   */
  async load(): Promise<PluginSettings> {
    const savedData = await this.plugin.loadData();
    return Object.assign({}, DEFAULT_SETTINGS, savedData);
  }

  /**
   * Save settings to disk
   */
  async save(settings: PluginSettings): Promise<void> {
    await this.plugin.saveData(settings);
  }
}
