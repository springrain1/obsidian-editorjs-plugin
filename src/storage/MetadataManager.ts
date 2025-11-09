import { App, TFile } from 'obsidian';
import { PluginError, ErrorCode } from '../errors/PluginError';

/**
 * Metadata stored in front-matter for Editor.js files
 */
export interface EditorJSMetadata {
  viewMode: 'markdown' | 'editorjs';
  blockIds: Record<string, string>; // blockId -> markdown line mapping
  lastModified: number;
  version: string;
}

/**
 * Manages metadata in file front-matter
 */
export class MetadataManager {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Get metadata from file front-matter
   */
  async getMetadata(file: TFile): Promise<EditorJSMetadata | null> {
    try {
      const content = await this.app.vault.read(file);
      const frontMatter = this.parseFrontMatter(content);
      
      if (!frontMatter || !frontMatter.editorjs) {
        return null;
      }

      return frontMatter.editorjs as EditorJSMetadata;
    } catch (error) {
      console.error('Failed to get metadata:', error);
      throw new PluginError(
        ErrorCode.METADATA_PARSE_ERROR,
        'Failed to parse file metadata',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update metadata in file front-matter
   */
  async updateMetadata(file: TFile, metadata: Partial<EditorJSMetadata>): Promise<void> {
    try {
      const content = await this.app.vault.read(file);
      const updatedContent = this.updateFrontMatter(content, metadata);
      await this.app.vault.modify(file, updatedContent);
    } catch (error) {
      console.error('Failed to update metadata:', error);
      throw new PluginError(
        ErrorCode.METADATA_PARSE_ERROR,
        'Failed to update file metadata',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Parse front-matter from file content
   */
  private parseFrontMatter(content: string): any {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      return null;
    }

    try {
      // Simple YAML parsing for our specific use case
      const yamlContent = match[1];
      const result: any = {};
      
      // Parse editorjs section
      const editorjsMatch = yamlContent.match(/editorjs:\s*\n([\s\S]*?)(?=\n\w+:|$)/);
      if (editorjsMatch) {
        result.editorjs = this.parseEditorJSSection(editorjsMatch[1]);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to parse front-matter:', error);
      return null;
    }
  }

  /**
   * Parse the editorjs section of front-matter
   */
  private parseEditorJSSection(content: string): Partial<EditorJSMetadata> {
    const result: any = {};
    const lines = content.split('\n');
    
    let currentKey: string | null = null;
    let blockIds: Record<string, string> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check for key-value pairs
      const kvMatch = trimmed.match(/^(\w+):\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1];
        const value = kvMatch[2];
        
        if (key === 'viewMode') {
          result.viewMode = value;
          currentKey = null;
        } else if (key === 'lastModified') {
          result.lastModified = parseInt(value);
          currentKey = null;
        } else if (key === 'version') {
          result.version = value.replace(/['"]/g, '');
          currentKey = null;
        } else if (key === 'blockIds') {
          currentKey = 'blockIds';
        }
      } else if (currentKey === 'blockIds') {
        // Parse blockId mapping
        const blockIdMatch = trimmed.match(/^["']?([^"':]+)["']?:\s*["']?([^"']+)["']?$/);
        if (blockIdMatch) {
          blockIds[blockIdMatch[1]] = blockIdMatch[2];
        }
      }
    }
    
    if (Object.keys(blockIds).length > 0) {
      result.blockIds = blockIds;
    }
    
    return result;
  }

  /**
   * Update front-matter with new metadata
   */
  private updateFrontMatter(content: string, metadata: Partial<EditorJSMetadata>): string {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = content.match(frontMatterRegex);
    
    let existingFrontMatter: any = {};
    let bodyContent = content;
    
    if (match) {
      existingFrontMatter = this.parseFrontMatter(content) || {};
      bodyContent = content.substring(match[0].length);
    }
    
    // Merge metadata
    if (!existingFrontMatter.editorjs) {
      existingFrontMatter.editorjs = {};
    }
    
    Object.assign(existingFrontMatter.editorjs, metadata);
    
    // Build new front-matter
    const newFrontMatter = this.buildFrontMatter(existingFrontMatter);
    
    return `---\n${newFrontMatter}\n---\n${bodyContent}`;
  }

  /**
   * Build front-matter string from object
   */
  private buildFrontMatter(data: any): string {
    const lines: string[] = [];
    
    if (data.editorjs) {
      lines.push('editorjs:');
      
      if (data.editorjs.viewMode) {
        lines.push(`  viewMode: ${data.editorjs.viewMode}`);
      }
      
      if (data.editorjs.blockIds && Object.keys(data.editorjs.blockIds).length > 0) {
        lines.push('  blockIds:');
        for (const [blockId, line] of Object.entries(data.editorjs.blockIds)) {
          lines.push(`    "${blockId}": "${line}"`);
        }
      }
      
      if (data.editorjs.lastModified) {
        lines.push(`  lastModified: ${data.editorjs.lastModified}`);
      }
      
      if (data.editorjs.version) {
        lines.push(`  version: "${data.editorjs.version}"`);
      }
    }
    
    return lines.join('\n');
  }
}
