/**
 * Internationalization (i18n) system for the plugin
 */

export type Language = 'en' | 'zh-CN';

export interface Translations {
  // Settings
  settingsTitle: string;
  autoSaveInterval: string;
  autoSaveIntervalDesc: string;
  imageFolder: string;
  imageFolderDesc: string;
  defaultViewMode: string;
  defaultViewModeDesc: string;
  editorTheme: string;
  editorThemeDesc: string;
  enableBackup: string;
  enableBackupDesc: string;
  enableVirtualScrolling: string;
  enableVirtualScrollingDesc: string;
  virtualScrollThreshold: string;
  virtualScrollThresholdDesc: string;
  language: string;
  languageDesc: string;
  enabledTools: string;
  enabledToolsDesc: string;
  
  // View modes
  markdown: string;
  richText: string;
  
  // Themes
  auto: string;
  light: string;
  dark: string;
  
  // Tools
  header: string;
  paragraph: string;
  list: string;
  checklist: string;
  table: string;
  image: string;
  code: string;
  quote: string;
  delimiter: string;
  warning: string;
  raw: string;
  embed: string;
  linkTool: string;
  attaches: string;
  simpleImage: string;
  
  // Commands
  openAsRichText: string;
  openAsMarkdown: string;
  
  // Notices
  switchedToRichText: string;
  switchedToMarkdown: string;
  failedToSwitch: string;
  noActiveFile: string;
  
  // Menu items
  openAsRichTextMenu: string;
  openAsMarkdownMenu: string;
}

const en: Translations = {
  // Settings
  settingsTitle: 'Editor.js Plugin Settings',
  autoSaveInterval: 'Auto-save interval',
  autoSaveIntervalDesc: 'Time in seconds between automatic saves (0 to disable)',
  imageFolder: 'Image folder',
  imageFolderDesc: 'Folder path for storing uploaded images',
  defaultViewMode: 'Default view mode',
  defaultViewModeDesc: 'Default editor mode when opening files',
  editorTheme: 'Editor theme',
  editorThemeDesc: 'Theme for the Editor.js interface',
  enableBackup: 'Enable backup',
  enableBackupDesc: 'Create automatic backups before saving',
  enableVirtualScrolling: 'Enable virtual scrolling',
  enableVirtualScrollingDesc: 'Improve performance for large documents',
  virtualScrollThreshold: 'Virtual scrolling threshold',
  virtualScrollThresholdDesc: 'Number of blocks before virtual scrolling activates',
  language: 'Language',
  languageDesc: 'Interface language',
  enabledTools: 'Enabled Tools',
  enabledToolsDesc: 'Select which Editor.js tools to enable',
  
  // View modes
  markdown: 'Markdown',
  richText: 'Rich Text (Editor.js)',
  
  // Themes
  auto: 'Auto (follow Obsidian)',
  light: 'Light',
  dark: 'Dark',
  
  // Tools
  header: 'Header',
  paragraph: 'Paragraph',
  list: 'List',
  checklist: 'Checklist',
  table: 'Table',
  image: 'Image',
  code: 'Code',
  quote: 'Quote',
  delimiter: 'Delimiter',
  warning: 'Warning',
  raw: 'Raw HTML',
  embed: 'Embed',
  linkTool: 'Link',
  attaches: 'Attaches',
  simpleImage: 'Simple Image',
  
  // Commands
  openAsRichText: 'Open as Rich Text View',
  openAsMarkdown: 'Open as Markdown',
  
  // Notices
  switchedToRichText: 'Switched to Rich Text view',
  switchedToMarkdown: 'Switched to Markdown view',
  failedToSwitch: 'Failed to switch view',
  noActiveFile: 'No active file found',
  
  // Menu items
  openAsRichTextMenu: 'Open as Rich Text View',
  openAsMarkdownMenu: 'Open as Markdown'
};

const zhCN: Translations = {
  // Settings
  settingsTitle: 'Editor.js 插件设置',
  autoSaveInterval: '自动保存间隔',
  autoSaveIntervalDesc: '自动保存的时间间隔（秒），设置为 0 禁用自动保存',
  imageFolder: '图片文件夹',
  imageFolderDesc: '存储上传图片的文件夹路径',
  defaultViewMode: '默认视图模式',
  defaultViewModeDesc: '打开文件时的默认编辑器模式',
  editorTheme: '编辑器主题',
  editorThemeDesc: 'Editor.js 界面的主题',
  enableBackup: '启用备份',
  enableBackupDesc: '保存前自动创建备份',
  enableVirtualScrolling: '启用虚拟滚动',
  enableVirtualScrollingDesc: '提高大型文档的性能',
  virtualScrollThreshold: '虚拟滚动阈值',
  virtualScrollThresholdDesc: '激活虚拟滚动前的块数量',
  language: '语言',
  languageDesc: '界面语言',
  enabledTools: '启用的工具',
  enabledToolsDesc: '选择要启用的 Editor.js 工具',
  
  // View modes
  markdown: 'Markdown',
  richText: '富文本 (Editor.js)',
  
  // Themes
  auto: '自动（跟随 Obsidian）',
  light: '浅色',
  dark: '深色',
  
  // Tools
  header: '标题',
  paragraph: '段落',
  list: '列表',
  checklist: '清单',
  table: '表格',
  image: '图片',
  code: '代码',
  quote: '引用',
  delimiter: '分隔符',
  warning: '警告',
  raw: '原始 HTML',
  embed: '嵌入',
  linkTool: '链接',
  attaches: '附件',
  simpleImage: '简单图片',
  
  // Commands
  openAsRichText: '打开为富文本视图',
  openAsMarkdown: '打开为 Markdown',
  
  // Notices
  switchedToRichText: '已切换到富文本视图',
  switchedToMarkdown: '已切换到 Markdown 视图',
  failedToSwitch: '切换视图失败',
  noActiveFile: '无法切换视图：未找到活动文件',
  
  // Menu items
  openAsRichTextMenu: '打开为富文本视图',
  openAsMarkdownMenu: '打开为 Markdown'
};

const translations: Record<Language, Translations> = {
  'en': en,
  'zh-CN': zhCN
};

/**
 * Get translation for current language
 */
export function t(language: Language): Translations {
  return translations[language] || translations['en'];
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): Array<{ value: Language; label: string }> {
  return [
    { value: 'en', label: 'English' },
    { value: 'zh-CN', label: '简体中文' }
  ];
}
