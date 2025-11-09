import { Plugin, WorkspaceLeaf, TFile, Menu, Notice } from 'obsidian';
import { PluginSettings, SettingsManager } from './settings/SettingsManager';
import { EditorJSSettingTab } from './settings/SettingsTab';
import { EditorJSView, VIEW_TYPE_EDITORJS } from './views/EditorJSView';
import { MetadataManager } from './storage/MetadataManager';

/**
 * Main plugin class for Obsidian Editor.js integration
 * Manages plugin lifecycle, settings, and view registration
 */
export default class ObsidianEditorJSPlugin extends Plugin {
  settings!: PluginSettings;
  settingsManager!: SettingsManager;
  metadataManager!: MetadataManager;

  /**
   * Called when the plugin is loaded
   * Initializes settings, registers views, commands, and event handlers
   */
  async onload(): Promise<void> {
    console.log('Loading Obsidian Editor.js Plugin');

    // Initialize settings manager
    this.settingsManager = new SettingsManager(this);
    
    // Initialize metadata manager
    this.metadataManager = new MetadataManager(this.app);
    
    // Load settings from disk
    await this.loadSettings();

    // Register EditorJS view
    this.registerView(
      VIEW_TYPE_EDITORJS,
      (leaf) => new EditorJSView(leaf, this)
    );

    // Register commands
    this.registerCommands();

    // Register pane menu items for Markdown views
    this.registerPaneMenuItems();

    // Register view mode memory
    this.registerViewModeMemory();

    // Add settings tab
    this.addSettingTab(new EditorJSSettingTab(this.app, this));

    console.log('Obsidian Editor.js Plugin loaded successfully');
  }

  /**
   * Called when the plugin is unloaded
   * Cleanup resources and event handlers
   */
  onunload(): void {
    console.log('Unloading Obsidian Editor.js Plugin');
  }

  /**
   * Load plugin settings from disk
   */
  async loadSettings(): Promise<void> {
    this.settings = await this.settingsManager.load();
  }

  /**
   * Save plugin settings to disk
   */
  async saveSettings(): Promise<void> {
    await this.settingsManager.save(this.settings);
  }

  /**
   * Register plugin commands
   */
  private registerCommands(): void {
    // Command: Open as EditorJS view
    this.addCommand({
      id: 'open-as-editorjs',
      name: '打开为富文本视图',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.extension === 'md') {
          if (!checking) {
            this.switchToEditorJSView();
          }
          return true;
        }
        return false;
      }
    });

    // Command: Open as Markdown view
    this.addCommand({
      id: 'open-as-markdown',
      name: '打开为 Markdown',
      checkCallback: (checking: boolean) => {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view.getViewType() === VIEW_TYPE_EDITORJS) {
          if (!checking) {
            this.switchToMarkdownView();
          }
          return true;
        }
        return false;
      }
    });
  }

  /**
   * Register pane menu items for Markdown views
   */
  private registerPaneMenuItems(): void {
    // Track which views have been patched to avoid duplicates
    const patchedViews = new WeakSet();

    // Hook into workspace to add menu items to Markdown views
    this.app.workspace.onLayoutReady(() => {
      // Patch existing markdown views
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (leaf.view.getViewType() === 'markdown') {
          this.patchMarkdownView(leaf, patchedViews);
        }
      });

      // Patch new markdown views when they become active
      this.registerEvent(
        this.app.workspace.on('active-leaf-change', (leaf) => {
          if (leaf && leaf.view.getViewType() === 'markdown') {
            this.patchMarkdownView(leaf, patchedViews);
          }
        })
      );
    });
  }

  /**
   * Patch a markdown view to add custom pane menu item
   */
  private patchMarkdownView(leaf: WorkspaceLeaf, patchedViews: WeakSet<any>): void {
    const view = leaf.view as any;
    
    // Check if already patched
    if (patchedViews.has(view)) {
      return;
    }
    
    // Mark as patched
    patchedViews.add(view);
    
    // Store original method
    const originalOnPaneMenu = view.onPaneMenu?.bind(view);
    
    // Override onPaneMenu
    view.onPaneMenu = (menu: Menu, source: string) => {
      // Call original implementation first
      if (originalOnPaneMenu) {
        originalOnPaneMenu(menu, source);
      }
      
      // Add our custom menu item
      const file = this.app.workspace.getActiveFile();
      if (file && file.extension === 'md') {
        menu.addItem((item) => {
          item
            .setTitle('打开为富文本视图')
            .setIcon('edit')
            .onClick(async () => {
              await this.switchToEditorJSView(leaf, file);
            });
        });
      }
    };
  }

  /**
   * Register view mode memory to remember user's last view preference
   */
  private registerViewModeMemory(): void {
    // Disabled for now to avoid conflicts with manual view switching
    // Users can manually switch views using the menu or commands
    
    /* 
    this.registerEvent(
      this.app.workspace.on('file-open', async (file: TFile | null) => {
        if (!file || file.extension !== 'md') {
          return;
        }

        // Read front-matter to check view mode preference
        const metadata = await this.metadataManager.getMetadata(file);
        if (metadata && metadata.viewMode === 'editorjs') {
          const activeLeaf = this.app.workspace.activeLeaf;
          if (activeLeaf && activeLeaf.view.getViewType() !== VIEW_TYPE_EDITORJS) {
            // Switch to EditorJS view if user's preference is editorjs
            await this.switchToEditorJSView(activeLeaf, file);
          }
        }
      })
    );
    */
  }

  /**
   * Switch current view to EditorJS view
   * @param leaf - Optional workspace leaf, defaults to active leaf
   * @param file - Optional file, defaults to active file
   */
  async switchToEditorJSView(leaf?: WorkspaceLeaf, file?: TFile): Promise<void> {
    try {
      const targetLeaf = leaf || this.app.workspace.activeLeaf;
      const targetFile = file || this.app.workspace.getActiveFile();

      if (!targetLeaf || !targetFile) {
        new Notice('无法切换视图：未找到活动文件');
        return;
      }

      // Set view state to EditorJS
      await targetLeaf.setViewState({
        type: VIEW_TYPE_EDITORJS,
        state: { file: targetFile.path }
      });

      new Notice('已切换到富文本视图');
    } catch (error) {
      console.error('Failed to switch to EditorJS view:', error);
      new Notice('切换到富文本视图失败');
    }
  }

  /**
   * Switch current view to Markdown view
   * @param leaf - Optional workspace leaf, defaults to active leaf
   * @param file - Optional file, defaults to active file
   */
  async switchToMarkdownView(leaf?: WorkspaceLeaf, file?: TFile): Promise<void> {
    try {
      const targetLeaf = leaf || this.app.workspace.activeLeaf;
      const targetFile = file || this.app.workspace.getActiveFile();

      if (!targetLeaf || !targetFile) {
        new Notice('无法切换视图：未找到活动文件');
        return;
      }

      // Set view state to Markdown
      await targetLeaf.setViewState({
        type: 'markdown',
        state: { file: targetFile.path, mode: 'source' }
      });

      new Notice('已切换到 Markdown 视图');
    } catch (error) {
      console.error('Failed to switch to Markdown view:', error);
      new Notice('切换到 Markdown 视图失败');
    }
  }
}
