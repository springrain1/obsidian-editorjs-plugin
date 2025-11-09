import { App, TFile, Vault, Notice } from 'obsidian';
import { OutputData } from '../editorjs/types';
import { MarkdownToBlocks } from '../converters/MarkdownToBlocks';
import { BlocksToMarkdown } from '../converters/BlocksToMarkdown';
import { MetadataManager, EditorJSMetadata } from './MetadataManager';
import { PluginError, ErrorCode } from '../errors/PluginError';

/**
 * Manages file operations for Editor.js integration
 */
export class FileManager {
  private app: App;
  private vault: Vault;
  private metadataManager: MetadataManager;
  private markdownToBlocks: MarkdownToBlocks;
  private blocksToMarkdown: BlocksToMarkdown;

  constructor(app: App) {
    this.app = app;
    this.vault = app.vault;
    this.metadataManager = new MetadataManager(app);
    this.markdownToBlocks = new MarkdownToBlocks();
    this.blocksToMarkdown = new BlocksToMarkdown();
  }

  /**
   * Read file content
   */
  async readFile(file: TFile): Promise<string> {
    try {
      return await this.vault.read(file);
    } catch (error) {
      console.error('Failed to read file:', error);
      throw new PluginError(
        ErrorCode.FILE_READ_ERROR,
        `Failed to read file: ${file.path}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Write content to file
   */
  async writeFile(file: TFile, content: string): Promise<void> {
    try {
      await this.vault.modify(file, content);
    } catch (error) {
      console.error('Failed to write file:', error);
      throw new PluginError(
        ErrorCode.FILE_WRITE_ERROR,
        `Failed to write file: ${file.path}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Create backup of file
   */
  async createBackup(file: TFile): Promise<void> {
    try {
      const content = await this.readFile(file);
      const backupPath = `${file.path}.backup`;
      
      // Check if backup already exists
      const existingBackup = this.vault.getAbstractFileByPath(backupPath);
      if (existingBackup instanceof TFile) {
        await this.vault.modify(existingBackup, content);
      } else {
        await this.vault.create(backupPath, content);
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      // Don't throw error for backup failure, just log it
    }
  }

  /**
   * Load file content as Editor.js blocks
   */
  async loadAsBlocks(file: TFile): Promise<OutputData> {
    try {
      const content = await this.readFile(file);
      
      // Remove front-matter before conversion
      const contentWithoutFrontMatter = this.removeFrontMatter(content);
      
      // Convert to blocks
      const blocks = this.markdownToBlocks.convert(contentWithoutFrontMatter);
      
      return blocks;
    } catch (error) {
      console.error('Failed to load file as blocks:', error);
      
      if (error instanceof PluginError) {
        throw error;
      }
      
      throw new PluginError(
        ErrorCode.CONVERSION_ERROR,
        'Failed to convert Markdown to blocks',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Save Editor.js blocks to file as Markdown
   */
  async saveFromBlocks(file: TFile, data: OutputData): Promise<void> {
    try {
      // Convert blocks to Markdown
      const markdown = this.blocksToMarkdown.convert(data);
      
      // Get existing content to preserve front-matter
      const existingContent = await this.readFile(file);
      const frontMatter = this.extractFrontMatter(existingContent);
      
      // Build block ID mapping
      const blockIds: Record<string, string> = {};
      data.blocks.forEach((block, index) => {
        if (block.id) {
          blockIds[block.id] = `line-${index}`;
        }
      });
      
      // Update metadata
      const metadata: Partial<EditorJSMetadata> = {
        viewMode: 'editorjs',
        blockIds: blockIds,
        lastModified: Date.now(),
        version: data.version || '2.31.0'
      };
      
      // Combine front-matter and content
      let finalContent = markdown;
      if (frontMatter) {
        finalContent = `${frontMatter}\n${markdown}`;
      }
      
      // Write to file
      await this.writeFile(file, finalContent);
      
      // Update metadata in front-matter
      await this.metadataManager.updateMetadata(file, metadata);
      
    } catch (error) {
      console.error('Failed to save blocks to file:', error);
      
      if (error instanceof PluginError) {
        throw error;
      }
      
      throw new PluginError(
        ErrorCode.CONVERSION_ERROR,
        'Failed to convert blocks to Markdown',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get metadata from file
   */
  async getMetadata(file: TFile): Promise<EditorJSMetadata | null> {
    return await this.metadataManager.getMetadata(file);
  }

  /**
   * Remove front-matter from content
   */
  private removeFrontMatter(content: string): string {
    const frontMatterRegex = /^---\n[\s\S]*?\n---\n/;
    return content.replace(frontMatterRegex, '');
  }

  /**
   * Extract front-matter from content
   */
  private extractFrontMatter(content: string): string | null {
    const frontMatterRegex = /^(---\n[\s\S]*?\n---)/;
    const match = content.match(frontMatterRegex);
    return match ? match[1] : null;
  }
}
