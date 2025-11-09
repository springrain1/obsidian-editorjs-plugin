import { OutputData, OutputBlockData } from '../editorjs/types';

/**
 * Converts Editor.js block format to Markdown text
 * Ensures CommonMark compliance and maintains round-trip consistency
 */
export class BlocksToMarkdown {
  /**
   * Convert Editor.js OutputData to Markdown string
   * @param data - The Editor.js output data to convert
   * @returns Markdown formatted string
   */
  convert(data: OutputData): string {
    if (!data.blocks || data.blocks.length === 0) {
      return '';
    }

    const markdownBlocks: string[] = [];

    for (const block of data.blocks) {
      const markdown = this.convertBlock(block);
      if (markdown !== null) {
        markdownBlocks.push(markdown);
      }
    }

    // Join blocks with newlines, ensuring proper spacing
    return markdownBlocks.join('\n\n');
  }

  /**
   * Convert a single block to Markdown
   */
  private convertBlock(block: OutputBlockData): string | null {
    switch (block.type) {
      case 'header':
        return this.convertHeader(block);
      case 'paragraph':
        return this.convertParagraph(block);
      case 'list':
        return this.convertList(block);
      case 'checklist':
        return this.convertChecklist(block);
      case 'code':
        return this.convertCode(block);
      case 'quote':
        return this.convertQuote(block);
      case 'table':
        return this.convertTable(block);
      case 'image':
        return this.convertImage(block);
      default:
        // Unsupported block type - convert to paragraph with warning
        return this.convertUnsupportedBlock(block);
    }
  }

  /**
   * Convert header block to Markdown heading
   */
  private convertHeader(block: OutputBlockData): string {
    const level = block.data.level || 1;
    const text = block.data.text || '';
    const hashes = '#'.repeat(Math.min(Math.max(level, 1), 6));
    return `${hashes} ${text}`;
  }

  /**
   * Convert paragraph block to plain text
   */
  private convertParagraph(block: OutputBlockData): string {
    return block.data.text || '';
  }

  /**
   * Convert list block to Markdown list
   */
  private convertList(block: OutputBlockData): string {
    const style = block.data.style || 'unordered';
    const items = block.data.items || [];
    
    return this.convertListItems(items, style, 0);
  }

  /**
   * Convert checklist block to Markdown task list
   */
  private convertChecklist(block: OutputBlockData): string {
    const items = block.data.items || [];
    const lines: string[] = [];

    items.forEach((item: any) => {
      const checked = item.checked ? 'x' : ' ';
      const text = item.text || '';
      lines.push(`- [${checked}] ${text}`);
    });

    return lines.join('\n');
  }

  /**
   * Convert list items recursively (handles nesting)
   */
  private convertListItems(items: any[], style: string, level: number): string {
    const lines: string[] = [];
    const indent = '  '.repeat(level);

    items.forEach((item, index) => {
      const marker = style === 'ordered' ? `${index + 1}.` : '-';
      const content = typeof item === 'string' ? item : item.content || '';
      
      lines.push(`${indent}${marker} ${content}`);

      // Handle nested items
      if (typeof item === 'object' && item.items && item.items.length > 0) {
        const nestedStyle = style; // Keep same style for nested items
        const nested = this.convertListItems(item.items, nestedStyle, level + 1);
        lines.push(nested);
      }
    });

    return lines.join('\n');
  }

  /**
   * Convert code block to Markdown code fence
   */
  private convertCode(block: OutputBlockData): string {
    const code = block.data.code || '';
    const language = block.data.language || '';
    
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  /**
   * Convert quote block to Markdown blockquote
   */
  private convertQuote(block: OutputBlockData): string {
    const text = block.data.text || '';
    const lines = text.split('\n');
    
    // Prefix each line with >
    return lines.map((line: string) => `> ${line}`).join('\n');
  }

  /**
   * Convert table block to Markdown table
   */
  private convertTable(block: OutputBlockData): string {
    const content = block.data.content || [];
    const withHeadings = block.data.withHeadings !== false;

    if (content.length === 0) {
      return '';
    }

    const lines: string[] = [];

    // Process each row
    content.forEach((row: string[], index: number) => {
      const cells = Array.isArray(row) ? row : [];
      const rowText = `| ${cells.join(' | ')} |`;
      lines.push(rowText);

      // Add separator after header row
      if (index === 0 && withHeadings) {
        const separator = `| ${cells.map(() => '---').join(' | ')} |`;
        lines.push(separator);
      }
    });

    return lines.join('\n');
  }

  /**
   * Convert image block to Markdown image syntax
   */
  private convertImage(block: OutputBlockData): string {
    const url = block.data.file?.url || '';
    const caption = block.data.caption || '';
    
    return `![${caption}](${url})`;
  }

  /**
   * Convert unsupported block type to paragraph with warning
   */
  private convertUnsupportedBlock(block: OutputBlockData): string {
    // Try to extract any text content
    let content = '';
    
    if (block.data.text) {
      content = block.data.text;
    } else if (block.data.content) {
      content = typeof block.data.content === 'string' 
        ? block.data.content 
        : JSON.stringify(block.data.content);
    } else {
      content = JSON.stringify(block.data);
    }

    // Return as plain text (could add a comment marker if needed)
    return content;
  }
}
