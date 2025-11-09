import { OutputData, OutputBlockData } from '../editorjs/types';

/**
 * Converts Markdown text to Editor.js block format
 * Supports CommonMark syntax and handles unsupported elements gracefully
 */
export class MarkdownToBlocks {
  private blockIdCounter = 0;

  /**
   * Convert Markdown string to Editor.js OutputData format
   * @param markdown - The Markdown text to convert
   * @returns OutputData object containing blocks array
   */
  convert(markdown: string): OutputData {
    this.blockIdCounter = 0;
    const lines = markdown.split('\n');
    const blocks: OutputBlockData[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Skip empty lines at the start
      if (!line.trim() && blocks.length === 0) {
        i++;
        continue;
      }

      // Try to parse code block
      if (line.trim().startsWith('```')) {
        const result = this.parseCodeBlock(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse table
      if (this.isTableLine(line) && i + 1 < lines.length && this.isTableSeparator(lines[i + 1])) {
        const result = this.parseTable(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse quote
      if (line.trim().startsWith('>')) {
        const result = this.parseQuote(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse checklist (task list)
      if (this.isChecklistItem(line)) {
        const result = this.parseChecklist(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse list
      if (this.isListItem(line)) {
        const result = this.parseList(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse heading
      const heading = this.parseHeading(line);
      if (heading) {
        blocks.push(heading);
        i++;
        continue;
      }

      // Try to parse image
      const image = this.parseImage(line);
      if (image) {
        blocks.push(image);
        i++;
        continue;
      }

      // Parse as paragraph (including empty lines between content)
      // Skip empty paragraphs to avoid Editor.js validation errors
      if (line.trim() || blocks.length === 0) {
        const paragraph = this.parseParagraph(line);
        blocks.push(paragraph);
      }
      i++;
    }

    return {
      time: Date.now(),
      blocks: blocks,
      version: '2.31.0'
    };
  }

  /**
   * Parse heading (# - ######)
   */
  private parseHeading(line: string): OutputBlockData | null {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) return null;

    const level = match[1].length;
    const text = match[2].trim();

    return {
      id: this.generateBlockId(),
      type: 'header',
      data: {
        text: text,
        level: level
      }
    };
  }

  /**
   * Parse paragraph (plain text)
   */
  private parseParagraph(line: string): OutputBlockData {
    // Ensure text is a string and handle empty lines
    const text = line || '';
    
    return {
      id: this.generateBlockId(),
      type: 'paragraph',
      data: {
        text: text
      }
    };
  }

  /**
   * Check if line is a checklist item (task list)
   */
  private isChecklistItem(line: string): boolean {
    const trimmed = line.trim();
    // Task list: - [ ] or - [x] or - [X]
    return /^[-*+]\s+\[([ xX])\]/.test(trimmed);
  }

  /**
   * Check if line is a list item
   */
  private isListItem(line: string): boolean {
    const trimmed = line.trim();
    // Unordered list: -, *, +
    if (/^[-*+]\s/.test(trimmed)) return true;
    // Ordered list: 1., 2., etc.
    if (/^\d+\.\s/.test(trimmed)) return true;
    return false;
  }

  /**
   * Get indentation level of a line
   */
  private getIndentLevel(line: string): number {
    const match = line.match(/^(\s*)/);
    if (!match) return 0;
    return Math.floor(match[1].length / 2); // 2 spaces = 1 level
  }

  /**
   * Parse checklist (task list)
   * Editor.js Checklist tool expects items with text and checked properties
   */
  private parseChecklist(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    const items: Array<{ text: string; checked: boolean }> = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i];
      
      if (!line.trim()) {
        // Empty line might end the checklist or be part of it
        if (i + 1 < lines.length && this.isChecklistItem(lines[i + 1])) {
          i++;
          continue;
        }
        break;
      }

      if (!this.isChecklistItem(line)) {
        break;
      }

      // Extract content and checked status from checklist item
      const trimmed = line.trim();
      const match = trimmed.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);
      if (match) {
        const checked = match[1].toLowerCase() === 'x';
        const text = match[2];
        items.push({ text: String(text), checked });
      }
      i++;
    }

    return {
      block: {
        id: this.generateBlockId(),
        type: 'checklist',
        data: {
          items: items
        }
      },
      nextIndex: i
    };
  }

  /**
   * Parse list (supports nested lists)
   * Editor.js List tool expects items as string array
   */
  private parseList(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    const firstLine = lines[startIndex].trim();
    const isOrdered = /^\d+\.\s/.test(firstLine);
    
    const items: string[] = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i];
      
      if (!line.trim()) {
        // Empty line might end the list or be part of it
        if (i + 1 < lines.length && this.isListItem(lines[i + 1])) {
          i++;
          continue;
        }
        break;
      }

      if (!this.isListItem(line)) {
        break;
      }

      // Extract content from list item
      const trimmed = line.trim();
      const contentMatch = trimmed.match(/^(?:[-*+]|\d+\.)\s+(.*)$/);
      const content = contentMatch ? contentMatch[1] : trimmed;
      
      // Ensure content is a string
      items.push(String(content));
      i++;
    }

    return {
      block: {
        id: this.generateBlockId(),
        type: 'list',
        data: {
          style: isOrdered ? 'ordered' : 'unordered',
          items: items
        }
      },
      nextIndex: i
    };
  }

  /**
   * Parse code block (```)
   */
  private parseCodeBlock(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    const firstLine = lines[startIndex].trim();
    const languageMatch = firstLine.match(/^```(\w+)?/);
    const language = languageMatch && languageMatch[1] ? languageMatch[1] : '';

    const codeLines: string[] = [];
    let i = startIndex + 1;

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim().startsWith('```')) {
        i++;
        break;
      }
      codeLines.push(line);
      i++;
    }

    return {
      block: {
        id: this.generateBlockId(),
        type: 'code',
        data: {
          code: codeLines.join('\n'),
          language: language
        }
      },
      nextIndex: i
    };
  }

  /**
   * Parse quote block (>)
   */
  private parseQuote(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    const quoteLines: string[] = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed.startsWith('>')) {
        break;
      }

      // Remove > and optional space
      const content = trimmed.replace(/^>\s?/, '');
      // Ensure content is a string
      quoteLines.push(String(content));
      i++;
    }

    // Join lines and ensure it's a string
    const text = quoteLines.join('\n');

    return {
      block: {
        id: this.generateBlockId(),
        type: 'quote',
        data: {
          text: String(text),
          caption: '',
          alignment: 'left'
        }
      },
      nextIndex: i
    };
  }

  /**
   * Check if line looks like a table row
   */
  private isTableLine(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|');
  }

  /**
   * Check if line is a table separator (|---|---|)
   */
  private isTableSeparator(line: string): boolean {
    const trimmed = line.trim();
    return /^\|[\s:-]+\|/.test(trimmed) && /^[\s|:-]+$/.test(trimmed);
  }

  /**
   * Parse table
   */
  private parseTable(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    const rows: string[][] = [];
    let i = startIndex;

    // Parse header
    const headerLine = lines[i];
    const headerCells = this.parseTableRow(headerLine);
    rows.push(headerCells);
    i++;

    // Skip separator line
    if (i < lines.length && this.isTableSeparator(lines[i])) {
      i++;
    }

    // Parse body rows
    while (i < lines.length) {
      const line = lines[i];
      if (!this.isTableLine(line)) {
        break;
      }
      const cells = this.parseTableRow(line);
      rows.push(cells);
      i++;
    }

    // Convert to Editor.js table format
    const withHeadings = rows.length > 0;
    const content = rows.map(row => row);

    return {
      block: {
        id: this.generateBlockId(),
        type: 'table',
        data: {
          withHeadings: withHeadings,
          content: content
        }
      },
      nextIndex: i
    };
  }

  /**
   * Parse a single table row
   */
  private parseTableRow(line: string): string[] {
    const trimmed = line.trim();
    // Remove leading and trailing |
    const content = trimmed.slice(1, -1);
    // Split by | and trim each cell
    return content.split('|').map(cell => cell.trim());
  }

  /**
   * Parse image (![alt](url))
   */
  private parseImage(line: string): OutputBlockData | null {
    const match = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (!match) return null;

    const caption = match[1];
    const url = match[2];

    return {
      id: this.generateBlockId(),
      type: 'image',
      data: {
        file: {
          url: url
        },
        caption: caption,
        withBorder: false,
        withBackground: false,
        stretched: false
      }
    };
  }

  /**
   * Generate unique block ID
   */
  private generateBlockId(): string {
    return `block-${Date.now()}-${this.blockIdCounter++}`;
  }
}
