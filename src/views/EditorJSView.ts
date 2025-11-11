import { ItemView, WorkspaceLeaf, TFile, Notice, Menu } from 'obsidian';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import NestedList from '@editorjs/nested-list';
import Table from '@editorjs/table';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import Delimiter from '@editorjs/delimiter';
import Embed from '@editorjs/embed';
import SimpleImage from '@editorjs/simple-image';
import Undo from 'editorjs-undo';
import DragDrop from 'editorjs-drag-drop';
import Alert from 'editorjs-alert';
import Tooltip from 'editorjs-tooltip';
import Personality from '@editorjs/personality';
import Hyperlink from 'editorjs-hyperlink';
import ToggleBlock from 'editorjs-toggle-block';
import ChangeCase from 'editorjs-change-case';
import Strikethrough from 'editorjs-strikethrough';
import Spoiler from 'editorjs-inline-spoiler-tool';

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
  private undo: any = null;

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

      // Validate blocks data
      if (!blocks || !blocks.blocks || !Array.isArray(blocks.blocks)) {
        throw new Error('Invalid blocks data structure');
      }

      // Validate and fix each block
      blocks.blocks = blocks.blocks.filter((block, index) => {
        if (!block.type) {
          return false;
        }
        if (!block.data) {
          block.data = {};
        }
        
        // Fix common data issues
        switch (block.type) {
          case 'paragraph':
            if (typeof block.data.text !== 'string') {
              block.data.text = String(block.data.text || '');
            }
            break;
          case 'header':
            if (typeof block.data.text !== 'string') {
              block.data.text = String(block.data.text || '');
            }
            if (typeof block.data.level !== 'number') {
              block.data.level = 2;
            }
            break;
          case 'list':
            if (!Array.isArray(block.data.items)) {
              block.data.items = [];
            }
            // NestedList expects items as objects with content property
            // Convert string items to NestedList format
            block.data.items = block.data.items
              .filter((item: any) => item !== undefined && item !== null)
              .map((item: any) => {
                if (typeof item === 'string') {
                  // Convert string to NestedList format
                  return {
                    content: item,
                    items: []
                  };
                } else if (typeof item === 'object' && item.content !== undefined) {
                  // Already in NestedList format
                  return {
                    content: String(item.content),
                    items: Array.isArray(item.items) ? item.items : []
                  };
                } else {
                  // Fallback: convert to NestedList format
                  return {
                    content: String(item),
                    items: []
                  };
                }
              });
            break;
          case 'checklist':
            if (!Array.isArray(block.data.items)) {
              block.data.items = [];
            }
            block.data.items = block.data.items.map((item: any) => ({
              text: String(item.text || ''),
              checked: Boolean(item.checked)
            }));
            break;
          case 'table':
            if (!Array.isArray(block.data.content)) {
              block.data.content = [[]];
            }
            break;
          case 'image':
            if (!block.data.file || !block.data.file.url) {
              return false;
            }
            break;
          case 'layout':
            // Validate layout block structure
            if (!block.data.itemContent || typeof block.data.itemContent !== 'object') {
              block.data.itemContent = {};
            }
            if (!block.data.layout || typeof block.data.layout !== 'object') {
              block.data.layout = {
                type: 'container',
                id: '',
                className: '',
                style: '',
                children: []
              };
            }
            break;
        }
        
        return true;
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
        // Silently fail on close
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
        inlineToolbar: ['marker', 'bold', 'underline', 'italic', 'strikethrough', 'inlineCode', 'link'],
        // Enable default shortcuts (Ctrl+Z, Ctrl+Y, etc.)
        defaultBlock: 'paragraph',
        // Sanitize data to prevent validation errors
        sanitizer: {
          b: true,
          i: true,
          u: true,
          a: {
            href: true,
            class: true
          },
          mark: {
            class: true
          },
          code: {
            class: true
          }
        },
        onChange: () => {
          // Trigger debounced save on change
          if (this.debouncedSave) {
            this.debouncedSave();
          }
        },
        onReady: () => {
          // Setup keyboard shortcuts
          this.setupKeyboardShortcuts();
        }
      });

      await this.editor.isReady;

      // Initialize Undo plugin
      this.undo = new Undo({ editor: this.editor });
      this.undo.initialize(data);
      
      // Initialize DragDrop plugin after DOM is ready
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        try {
          if (this.editor) {
            new DragDrop(this.editor);
          }
        } catch (error) {
          // Silently fail if drag-drop initialization fails
          // This can happen if DOM elements are not yet available
        }
      });

      // Setup debounced save
      this.debouncedSave = debounce(async () => {
        await this.saveFile();
      }, 500);

    } catch (error) {
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
      tools.paragraph = {
        class: Paragraph,
        inlineToolbar: true,
        config: {
          placeholder: 'Enter text',
          preserveBlank: false
        }
      };
    }

    if (enabledTools.includes('list')) {
      // Use NestedList for better nested list support
      tools.list = {
        class: NestedList,
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

    if (enabledTools.includes('simpleImage')) {
      tools.simpleImage = SimpleImage;
    }
    
    // New tools
    if (enabledTools.includes('alert')) {
      tools.alert = {
        class: Alert,
        inlineToolbar: true,
        config: {
          defaultType: 'primary',
          messagePlaceholder: 'Enter message'
        }
      };
    }
    
    
    if (enabledTools.includes('tooltip')) {
      tools.tooltip = {
        class: Tooltip,
        config: {
          location: 'left',
          underline: true,
          placeholder: 'Tooltip text',
          highlightColor: '#FFEFD5',
          backgroundColor: '#154360',
          textColor: '#FDFEFE',
          holder: 'editorjs'
        }
      };
    }
    
    if (enabledTools.includes('personality')) {
      tools.personality = {
        class: Personality,
        config: {
          nameMaxLength: 30,
          textMaxLength: 500
        }
      };
    }

    // New advanced tools
    if (enabledTools.includes('toggle')) {
      tools.toggle = {
        class: ToggleBlock,
        inlineToolbar: true,
        config: {
          placeholder: 'Toggle content'
        }
      };
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
    tools.strikethrough = {
      class: Strikethrough,
      shortcut: 'CMD+SHIFT+X'
    };
    tools.spoiler = Spoiler;
    tools.changeCase = {
      class: ChangeCase
    };
    tools.hyperlink = {
      class: Hyperlink,
      config: {
        shortcut: 'CMD+L',
        target: '_blank',
        rel: 'nofollow',
        availableTargets: ['_blank', '_self'],
        availableRels: ['author', 'noreferrer'],
        validate: false,
      }
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

    } catch (error) {
      new Notice('Failed to save file');
      throw error;
    }
  }

  /**
   * Destroy editor instance
   */
  private destroyEditor(): void {
    // Note: editorjs-undo doesn't have a destroy method, just clear the reference
    if (this.undo) {
      this.undo = null;
    }
    
    if (this.editor) {
      try {
        this.editor.destroy();
        this.editor = null;
      } catch (error) {
        // Silently fail on destroy
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
      // Silently fail
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
   * Setup keyboard shortcuts for undo/redo
   * Uses high priority event capture to intercept before Obsidian's handlers
   */
  private setupKeyboardShortcuts(): void {
    if (!this.editorContainer) return;
    
    // Use capture phase to intercept events before Obsidian
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      
      // Ctrl/Cmd+Z for undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (this.undo) {
          this.undo.undo();
        }
        return;
      }
      
      // Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y for redo
      if (isMod && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault();
        e.stopPropagation();
        if (this.undo) {
          this.undo.redo();
        }
        return;
      }
      
      // Ctrl/Cmd+S for save
      if (isMod && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        this.saveFile();
        return;
      }
    };
    
    // Add listener in capture phase with high priority
    this.editorContainer.addEventListener('keydown', handleKeyDown, true);
    
    // Clean up on view close
    this.register(() => {
      this.editorContainer?.removeEventListener('keydown', handleKeyDown, true);
    });
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
      }).catch(() => {
        // Silently fail on refresh
      });
    }
  }
}
