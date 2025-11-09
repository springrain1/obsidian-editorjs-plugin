import { ItemView, WorkspaceLeaf, TFile, Notice, Menu } from 'obsidian';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import Delimiter from '@editorjs/delimiter';
import Warning from '@editorjs/warning';
import RawTool from '@editorjs/raw';
import Embed from '@editorjs/embed';
import LinkTool from '@editorjs/link';
import AttachesTool from '@editorjs/attaches';
import SimpleImage from '@editorjs/simple-image';

import ObsidianEditorJSPlugin from '../main';
import { OutputData } from '../editorjs/types';
import { FileManager } from '../storage/FileManager';
import { ImageHandler } from '../image/ImageHandler';
import { ThemeAdapter } from '../theme/ThemeAdapter';
import { debounce } from '../utils/Debounce';
import { PluginError, ErrorCode } from '../errors/PluginError';

export const VIEW_TYPE_EDITORJS = 'editorjs-view';

/**
 * Editor.js view for Obsidian
 * Provides a block-based rich text editing experience
 */
export class EditorJSView extends ItemView {
  private plugin: ObsidianEditorJSPlugin;
  private editor: EditorJS | null = null;
  private fileManager: FileManager;
  private imageHandler: ImageHandler;
  private themeAdapter: ThemeAdapter;
  private file: TFile | null = null;
  private editorContainer: HTMLElement | null = null;
  private debouncedSave: (() => void) | null = null;
  private isInitialized = false;

  constructor(leaf: WorkspaceLeaf, plugin: ObsidianEditorJSPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.fileManager = new FileManager(this.app);
    this.imageHandler = new ImageHandler(this.app, plugin.settings);
    this.themeAdapter = new ThemeAdapter(this.app);
  }

  /**
   * Get view type identifier
   */
  getViewType(): string {
    return VIEW_TYPE_EDITORJS;
  }

  /**
   * Get display text for view
   */
  getDisplayText(): string {
    return this.file?.basename || 'Editor.js';
  }

  /**
   * Get icon for view
   */
  getIcon(): string {
    return 'edit';
  }

  /**
   * Called when view is opened
   */
  async onOpen(): Promise<void> {
    // Create editor container with CSS namespace
    this.createEditorContainer();
  }

  /**
   * Set view state - called when switching to this view
   */
  async setState(state: any, result: any): Promise<void> {
    await super.setState(state, result);

    try {
      // Get file from state
      if (state && state.file) {
        const file = this.app.vault.getAbstractFileByPath(state.file);
        if (file instanceof TFile) {
          await this.loadFileContent(file);
        } else {
          new Notice('文件未找到');
        }
      } else {
        // Fallback to active file
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          await this.loadFileContent(activeFile);
        } else {
          new Notice('未找到活动文件');
        }
      }
    } catch (error) {
      console.error('Failed to set state:', error);
      this.handleError(error);
    }
  }

  /**
   * Get view state
   */
  getState(): any {
    return {
      file: this.file?.path
    };
  }

  /**
   * Load file content and initialize editor
   */
  private async loadFileContent(file: TFile): Promise<void> {
    try {
      this.file = file;

      // Load file content and convert to blocks
      const blocks = await this.fileManager.loadAsBlocks(this.file);

      // Debug: log the blocks data
      console.log('Loaded blocks:', JSON.stringify(blocks, null, 2));

      // Validate blocks data
      if (!blocks || !blocks.blocks || !Array.isArray(blocks.blocks)) {
        throw new Error('Invalid blocks data structure');
      }

      // Validate each block
      blocks.blocks.forEach((block, index) => {
        if (!block.type) {
          console.warn(`Block ${index} missing type:`, block);
        }
        if (!block.data) {
          console.warn(`Block ${index} missing data:`, block);
        }
        if (block.type === 'paragraph' && typeof block.data.text !== 'string') {
          console.warn(`Block ${index} paragraph has invalid text:`, block.data);
          // Fix it
          block.data.text = String(block.data.text || '');
        }
      });

      // Destroy existing editor if any
      if (this.editor) {
        this.destroyEditor();
      }

      // Initialize Editor.js
      await this.initializeEditor(blocks);

      // Apply theme
      if (this.editorContainer) {
        this.themeAdapter.applyTheme(this.editorContainer);
      }

      // Watch for theme changes (only once)
      if (!this.isInitialized) {
        this.themeAdapter.watchThemeChanges(() => {
          if (this.editorContainer) {
            this.themeAdapter.applyTheme(this.editorContainer);
          }
        });
      }

      this.isInitialized = true;

    } catch (error) {
      console.error('Failed to load file content:', error);
      this.handleError(error);
    }
  }

  /**
   * Called when view is closed
   */
  async onClose(): Promise<void> {
    // Save before closing
    if (this.editor && this.isInitialized) {
      try {
        await this.saveFile();
      } catch (error) {
        console.error('Failed to save on close:', error);
      }
    }

    // Destroy editor
    this.destroyEditor();

    // Clear references
    this.file = null;
    this.editorContainer = null;
    this.debouncedSave = null;
    this.isInitialized = false;
  }

  /**
   * Create editor container with CSS namespace
   */
  private createEditorContainer(): void {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('obsidian-editorjs-plugin');

    // Create editor holder
    this.editorContainer = container.createDiv({
      cls: 'editorjs-container'
    });
    this.editorContainer.createDiv({
      attr: { id: 'editorjs' }
    });
  }

  /**
   * Initialize Editor.js instance
   */
  private async initializeEditor(data: OutputData): Promise<void> {
    if (!this.editorContainer) {
      throw new PluginError(
        ErrorCode.EDITOR_INIT_FAILED,
        'Editor container not found'
      );
    }

    try {
      // Get tools configuration
      const tools = this.getToolsConfig();

      // Create editor instance
      this.editor = new EditorJS({
        holder: 'editorjs',
        data: data,
        tools: tools,
        placeholder: 'Press Tab to select a Block',
        autofocus: true,
        inlineToolbar: ['link', 'marker', 'bold', 'italic', 'inlineCode', 'underline'],
        onChange: () => {
          // Trigger debounced save on change
          if (this.debouncedSave) {
            this.debouncedSave();
          }
        },
        onReady: () => {
          console.log('Editor.js is ready');
          // Log available tools for debugging
          console.log('Available tools:', Object.keys(tools));
        }
      });

      await this.editor.isReady;

      // Setup debounced save
      this.debouncedSave = debounce(async () => {
        await this.saveFile();
      }, 500);

    } catch (error) {
      console.error('Failed to initialize editor:', error);
      throw new PluginError(
        ErrorCode.EDITOR_INIT_FAILED,
        'Failed to initialize Editor.js',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get tools configuration for Editor.js
   */
  private getToolsConfig(): any {
    const enabledTools = this.plugin.settings.enabledTools;
    const tools: any = {};

    // Add block tools based on settings
    if (enabledTools.includes('header')) {
      tools.header = {
        class: Header,
        config: {
          placeholder: 'Enter a header',
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 2
        }
      };
    }

    if (enabledTools.includes('paragraph')) {
      // Paragraph is default, no need to configure
    }

    if (enabledTools.includes('list')) {
      tools.list = {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        }
      };
    }

    if (enabledTools.includes('checklist')) {
      tools.checklist = {
        class: Checklist,
        inlineToolbar: true
      };
    }

    if (enabledTools.includes('table')) {
      tools.table = {
        class: Table,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 3
        }
      };
    }

    if (enabledTools.includes('image')) {
      tools.image = {
        class: Image,
        config: {
          uploader: {
            uploadByFile: async (file: File) => {
              return await this.imageHandler.uploadByFile(file);
            },
            uploadByUrl: async (url: string) => {
              return await this.imageHandler.uploadByUrl(url);
            }
          },
          captionPlaceholder: 'Image caption',
          buttonContent: 'Select an image',
          types: 'image/*'
        }
      };
    }

    if (enabledTools.includes('code')) {
      tools.code = {
        class: Code,
        config: {
          placeholder: 'Enter code'
        }
      };
    }

    if (enabledTools.includes('quote')) {
      tools.quote = {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: 'Quote author'
        }
      };
    }

    if (enabledTools.includes('delimiter')) {
      tools.delimiter = Delimiter;
    }

    if (enabledTools.includes('warning')) {
      tools.warning = {
        class: Warning,
        inlineToolbar: true,
        config: {
          titlePlaceholder: 'Title',
          messagePlaceholder: 'Message'
        }
      };
    }

    if (enabledTools.includes('raw')) {
      tools.raw = RawTool;
    }

    if (enabledTools.includes('embed')) {
      tools.embed = {
        class: Embed,
        config: {
          services: {
            youtube: true,
            vimeo: true,
            twitter: true,
            instagram: true,
            codepen: true,
            github: true
          }
        }
      };
    }

    if (enabledTools.includes('linkTool')) {
      tools.linkTool = {
        class: LinkTool,
        config: {
          endpoint: ''  // No backend endpoint needed for basic functionality
        }
      };
    }

    if (enabledTools.includes('attaches')) {
      tools.attaches = {
        class: AttachesTool,
        config: {
          uploader: {
            uploadByFile: async (file: File) => {
              // Similar to image upload
              return await this.imageHandler.uploadByFile(file);
            }
          }
        }
      };
    }

    if (enabledTools.includes('simpleImage')) {
      tools.simpleImage = SimpleImage;
    }

    // Add inline tools (always enabled for text formatting)
    tools.marker = {
      class: Marker,
      shortcut: 'CMD+SHIFT+M'
    };
    tools.inlineCode = {
      class: InlineCode,
      shortcut: 'CMD+SHIFT+C'
    };
    tools.underline = {
      class: Underline,
      shortcut: 'CMD+U'
    };

    return tools;
  }

  /**
   * Save file content
   */
  private async saveFile(): Promise<void> {
    if (!this.editor || !this.file) {
      return;
    }

    try {
      // Get data from editor
      const data = await this.editor.save();

      // Create backup if enabled
      if (this.plugin.settings.enableBackup) {
        await this.fileManager.createBackup(this.file);
      }

      // Save to file
      await this.fileManager.saveFromBlocks(this.file, data);

      console.log('File saved successfully');

    } catch (error) {
      console.error('Failed to save file:', error);
      new Notice('Failed to save file');
      throw error;
    }
  }

  /**
   * Destroy editor instance
   */
  private destroyEditor(): void {
    if (this.editor) {
      try {
        this.editor.destroy();
        this.editor = null;
      } catch (error) {
        console.error('Failed to destroy editor:', error);
      }
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    let message = 'An error occurred';

    if (error instanceof PluginError) {
      message = error.message;

      // Log detailed error
      console.error(`Plugin Error [${error.code}]:`, error.message);
      if (error.originalError) {
        console.error('Original error:', error.originalError);
      }

      // Handle specific error types
      if (error.code === ErrorCode.EDITOR_INIT_FAILED) {
        message = 'Failed to initialize editor. Falling back to Markdown view.';
        // Switch back to markdown view
        this.switchToMarkdownView();
      }
    } else if (error instanceof Error) {
      message = error.message;
      console.error('Error:', error);
    }

    new Notice(message);
  }

  /**
   * Switch to markdown view
   */
  private async switchToMarkdownView(): Promise<void> {
    if (!this.file) return;

    try {
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(this.file, { state: { mode: 'source' } });
    } catch (error) {
      console.error('Failed to switch to markdown view:', error);
    }
  }

  /**
   * Load a specific file
   */
  async loadFile(file: TFile): Promise<void> {
    await this.loadFileContent(file);
  }

  /**
   * Populate the pane menu (more options menu in the top right)
   */
  onPaneMenu(menu: Menu, source: string): void {
    // Add "Open as Markdown" option
    menu.addItem((item) => {
      item
        .setTitle('打开为 Markdown')
        .setIcon('document')
        .onClick(async () => {
          if (this.file) {
            await this.plugin.switchToMarkdownView(this.leaf, this.file);
          }
        });
    });

    // Call parent implementation
    super.onPaneMenu(menu, source);
  }

  /**
   * Refresh the view (called when settings change)
   */
  refresh(): void {
    // Reapply theme
    if (this.editorContainer) {
      this.themeAdapter.applyTheme(this.editorContainer);
    }

    // If editor is initialized and file is loaded, reload to apply tool changes
    if (this.editor && this.file && this.isInitialized) {
      // Save current state
      this.editor.save().then(async (data) => {
        // Destroy and reinitialize editor with new settings
        this.destroyEditor();
        await this.initializeEditor(data);

        // Reapply theme
        if (this.editorContainer) {
          this.themeAdapter.applyTheme(this.editorContainer);
        }
      }).catch((error) => {
        console.error('Failed to refresh editor:', error);
      });
    }
  }
}
