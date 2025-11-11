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

      // Try to parse math block ($$)
      if (line.trim() === '$$') {
        const result = this.parseMathBlock(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }
      
      // Try to parse code block
      if (line.trim().startsWith('```')) {
        const result = this.parseCodeBlock(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }
      
      // Try to parse toggle block (details/summary)
      if (line.trim().startsWith('<details')) {
        const result = this.parseToggleBlock(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }
      
      // Try to parse layout columns
      if (line.trim() === '<!-- columns -->') {
        const result = this.parseLayoutBlock(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse table (with or without separator)
      if (this.isTableLine(line)) {
        // Check if next line is separator (standard table)
        if (i + 1 < lines.length && this.isTableSeparator(lines[i + 1])) {
          const result = this.parseTable(lines, i);
          blocks.push(result.block);
          i = result.nextIndex;
          continue;
        }
        // Or check if this looks like a single-line table
        if (line.split('|').filter(cell => cell.trim()).length >= 2) {
          const result = this.parseSingleLineTable(line);
          blocks.push(result);
          i++;
          continue;
        }
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

      // Try to parse Obsidian embed as image
      const obsidianEmbed = this.parseObsidianEmbed(line);
      if (obsidianEmbed) {
        blocks.push(obsidianEmbed);
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

      // Try to parse horizontal rule (delimiter)
      if (this.isDelimiter(line)) {
        blocks.push(this.parseDelimiter());
        i++;
        continue;
      }

      // Try to parse Obsidian callout (alert)
      if (line.trim().match(/^>\s*\[!(\w+)\]/)) {
        const result = this.parseCallout(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }
      
      // Try to parse warning block
      if (line.trim().startsWith('> ⚠️')) {
        const result = this.parseWarning(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse raw HTML
      if (line.trim() === '<!-- raw-html -->') {
        const result = this.parseRawHtml(lines, i);
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }

      // Try to parse button (link with button emoji)
      const buttonMatch = line.trim().match(/^\[🔘\s*(.+?)\]\((.+?)\)$/);
      if (buttonMatch) {
        blocks.push(this.parseButton(buttonMatch[1], buttonMatch[2]));
        i++;
        continue;
      }
      
      // Try to parse link (standalone link on its own line)
      const linkResult = this.parseLinkTool(line, lines.slice(i + 1));
      if (linkResult.block) {
        blocks.push(linkResult.block);
        i += 1 + linkResult.linesConsumed;
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
   * Handle Obsidian wikilinks and embeds
   */
  private parseHeading(line: string): OutputBlockData | null {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) return null;

    const level = match[1].length;
    let text = match[2].trim();
    
    // Handle Obsidian embed syntax ![[file]]
    text = text.replace(/!\[\[([^\]]+?)\]\]/g, (m, file) => {
      return `!<a href="${file}" class="obsidian-link">${file}</a>`;
    });
    
    // Handle Obsidian wikilinks in headings
    text = text.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (m, link, display) => {
      const displayText = display || link;
      return `<a href="${link}" class="obsidian-link">${displayText}</a>`;
    });

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
   * Handles Obsidian-specific syntax like [[wikilinks]], tags, etc.
   */
  private parseParagraph(line: string): OutputBlockData {
    // Ensure text is a string and handle empty lines
    let text = line || '';
    
    // Handle Obsidian embed syntax ![[file]] first (before regular wikilinks)
    text = text.replace(/!\[\[([^\]]+?)\]\]/g, (match, file) => {
      // Keep as embed link with special marker
      return `!<a href="${file}" class="obsidian-link">${file}</a>`;
    });
    
    // Convert Obsidian wikilinks to HTML links for Editor.js
    // [[link]] -> <a href="link">link</a>
    text = text.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (match, link, display) => {
      const displayText = display || link;
      return `<a href="${link}" class="obsidian-link">${displayText}</a>`;
    });
    
    // Handle Obsidian tags #tag (keep as-is for now)
    // Tags are already compatible with Editor.js
    
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
    // 4 spaces or 1 tab = 1 level
    const spaces = match[1].replace(/\t/g, '    ');
    return Math.floor(spaces.length / 4);
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
        let text = match[2] || '';
        
        // Handle Obsidian embed syntax ![[file]]
        text = text.replace(/!\[\[([^\]]+?)\]\]/g, (m, file) => {
          return `!<a href="${file}" class="obsidian-link">${file}</a>`;
        });
        
        // Handle Obsidian wikilinks in checklist items
        text = text.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (m, link, display) => {
          const displayText = display || link;
          return `<a href="${link}" class="obsidian-link">${displayText}</a>`;
        });
        
        // Ensure text is a non-empty string (Editor.js Checklist requirement)
        items.push({ 
          text: String(text || ' '), 
          checked: Boolean(checked) 
        });
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
   * Parse list (supports nested lists by preserving indentation)
   * NestedList tool expects items as objects with content and optional items properties
   */
  private parseList(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    const firstLine = lines[startIndex].trim();
    const isOrdered = /^\d+\.\s/.test(firstLine);
    const baseIndent = this.getIndentLevel(lines[startIndex]);
    
    const items: any[] = [];
    const stack: Array<{ level: number; item: any }> = [];
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

      // Get indentation level
      const currentIndent = this.getIndentLevel(line);
      const relativeIndent = currentIndent - baseIndent;
      
      // Extract content from list item
      const trimmed = line.trim();
      const contentMatch = trimmed.match(/^(?:[-*+]|\d+\.)\s+(.*)$/);
      let content = contentMatch ? contentMatch[1] : trimmed;
      
      // Handle Obsidian embed syntax ![[link]] (keep the !)
      content = content.replace(/!\[\[([^\]]+?)\]\]/g, (m, link) => {
        return `!<a href="${link}" class="obsidian-link">${link}</a>`;
      });
      
      // Handle Obsidian wikilinks in list items
      content = content.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (m, link, display) => {
        const displayText = display || link;
        return `<a href="${link}" class="obsidian-link">${displayText}</a>`;
      });
      
      // Create new item
      const newItem = {
        content: String(content),
        items: []
      };
      
      // Pop stack until we find the right parent level
      while (stack.length > 0 && stack[stack.length - 1].level >= relativeIndent) {
        stack.pop();
      }
      
      if (relativeIndent === 0 || stack.length === 0) {
        // Top-level item
        items.push(newItem);
        stack.push({ level: relativeIndent, item: newItem });
      } else {
        // Nested item - add to parent
        const parent = stack[stack.length - 1].item;
        if (!parent.items) {
          parent.items = [];
        }
        parent.items.push(newItem);
        stack.push({ level: relativeIndent, item: newItem });
      }
      
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
   * Parse table (Obsidian compatible)
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
   * Parse a single table row (handle escaped pipes)
   */
  private parseTableRow(line: string): string[] {
    const trimmed = line.trim();
    // Remove leading and trailing |
    const content = trimmed.slice(1, -1);
    
    // Split by unescaped pipes
    const cells: string[] = [];
    let currentCell = '';
    let escaped = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (char === '\\' && !escaped) {
        escaped = true;
        continue;
      }
      
      if (char === '|' && !escaped) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
        escaped = false;
      }
    }
    
    // Add last cell
    cells.push(currentCell.trim());
    
    return cells;
  }
  
  /**
   * Parse a single-line table (without separator)
   */
  private parseSingleLineTable(line: string): OutputBlockData {
    const cells = this.parseTableRow(line);
    
    return {
      id: this.generateBlockId(),
      type: 'table',
      data: {
        withHeadings: false,
        content: [cells]
      }
    };
  }

  /**
   * Parse Obsidian embed syntax ![[file]]
   */
  private parseObsidianEmbed(line: string): OutputBlockData | null {
    const match = line.trim().match(/^!\[\[([^\]]+?)\]\]$/);
    if (!match) return null;

    const file = match[1];
    
    // Check if it's an image file
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];
    const isImage = imageExtensions.some(ext => file.toLowerCase().endsWith(ext));
    
    if (isImage) {
      return {
        id: this.generateBlockId(),
        type: 'image',
        data: {
          file: {
            url: file
          },
          caption: '',
          withBorder: false,
          withBackground: false,
          stretched: false
        }
      };
    }
    
    // For non-image embeds, treat as paragraph with link
    return null;
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
   * Check if line is a delimiter (horizontal rule)
   */
  private isDelimiter(line: string): boolean {
    const trimmed = line.trim();
    // Match ---, ***, or ___
    return /^([-*_])\1{2,}$/.test(trimmed);
  }

  /**
   * Parse delimiter (horizontal rule)
   */
  private parseDelimiter(): OutputBlockData {
    return {
      id: this.generateBlockId(),
      type: 'delimiter',
      data: {}
    };
  }

  /**
   * Parse warning block (> ⚠️ **Title** / > Message)
   */
  private parseWarning(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    let i = startIndex;
    let title = '';
    let message = '';

    // First line with warning emoji
    const firstLine = lines[i].trim();
    const titleMatch = firstLine.match(/^>\s*⚠️\s*\*\*(.+?)\*\*/);
    if (titleMatch) {
      title = titleMatch[1];
      i++;
    }

    // Subsequent lines as message
    const messageLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed.startsWith('>')) {
        break;
      }

      const content = trimmed.replace(/^>\s?/, '');
      if (content && !content.startsWith('⚠️')) {
        messageLines.push(content);
      }
      i++;
    }

    message = messageLines.join('\n');

    return {
      block: {
        id: this.generateBlockId(),
        type: 'warning',
        data: {
          title: title,
          message: message
        }
      },
      nextIndex: i
    };
  }

  /**
   * Parse raw HTML block
   */
  private parseRawHtml(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    let i = startIndex + 1; // Skip <!-- raw-html -->
    const htmlLines: string[] = [];

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '<!-- /raw-html -->') {
        i++;
        break;
      }
      htmlLines.push(line);
      i++;
    }

    return {
      block: {
        id: this.generateBlockId(),
        type: 'raw',
        data: {
          html: htmlLines.join('\n')
        }
      },
      nextIndex: i
    };
  }

  /**
   * Parse linkTool (standalone link with optional description)
   */
  private parseLinkTool(line: string, nextLines: string[]): { block: OutputBlockData | null; linesConsumed: number } {
    // Check for JSON data comment first
    if (nextLines.length > 0) {
      const jsonBlock = this.tryParseJsonComment(nextLines[0]);
      if (jsonBlock) {
        return { block: jsonBlock, linesConsumed: 1 };
      }
    }
    
    // Match [text](url) format for attachments or rich links
    const attachMatch = line.trim().match(/^\[📎\s*(.+?)\]\((.+?)\)$/);
    if (attachMatch) {
      const title = attachMatch[1];
      const url = attachMatch[2];
      
      return {
        block: {
          id: this.generateBlockId(),
          type: 'attaches',
          data: {
            file: {
              url: url,
              name: title
            },
            title: title
          }
        },
        linesConsumed: 0
      };
    }

    // Match rich link format (not inline in paragraph)
    const linkMatch = line.trim().match(/^\[(.+?)\]\((.+?)\)$/);
    if (linkMatch && !line.includes(' ')) {
      const text = linkMatch[1];
      const url = linkMatch[2];
      
      // Check if it's an embed URL (YouTube, Vimeo, etc.)
      if (this.isEmbedUrl(url)) {
        return {
          block: {
            id: this.generateBlockId(),
            type: 'embed',
            data: {
              service: this.getEmbedService(url),
              source: url,
              embed: url,
              caption: text !== url ? text : ''
            }
          },
          linesConsumed: 0
        };
      }
      
      // Otherwise treat as linkTool
      return {
        block: {
          id: this.generateBlockId(),
          type: 'linkTool',
          data: {
            link: url,
            meta: {
              title: text
            }
          }
        },
        linesConsumed: 0
      };
    }

    return { block: null, linesConsumed: 0 };
  }
  
  /**
   * Try to parse JSON data from HTML comment
   */
  private tryParseJsonComment(line: string): OutputBlockData | null {
    const match = line.trim().match(/^<!--\s*editorjs-data:\s*(.+?)\s*-->$/);
    if (!match) return null;
    
    try {
      const unescaped = match[1].replace(/&#45;&#45;/g, '--');
      const parsed = JSON.parse(unescaped);
      
      if (parsed.type && parsed.data) {
        return {
          id: this.generateBlockId(),
          type: parsed.type,
          data: parsed.data
        };
      }
    } catch (error) {
      // Silently fail on JSON parse
    }
    
    return null;
  }

  /**
   * Check if URL is an embed service
   */
  private isEmbedUrl(url: string): boolean {
    const embedPatterns = [
      /youtube\.com\/watch/,
      /youtu\.be\//,
      /vimeo\.com\//,
      /twitter\.com\//,
      /instagram\.com\//,
      /codepen\.io\//,
      /github\.com\//
    ];
    
    return embedPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Get embed service name from URL
   */
  private getEmbedService(url: string): string {
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/vimeo\.com/.test(url)) return 'vimeo';
    if (/twitter\.com/.test(url)) return 'twitter';
    if (/instagram\.com/.test(url)) return 'instagram';
    if (/codepen\.io/.test(url)) return 'codepen';
    if (/github\.com/.test(url)) return 'github';
    return 'unknown';
  }

  /**
   * Parse Obsidian callout as alert block
   */
  private parseCallout(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    let i = startIndex;
    const firstLine = lines[i].trim();
    
    // Extract callout type
    const typeMatch = firstLine.match(/^>\s*\[!(\w+)\]/);
    const calloutType = typeMatch ? typeMatch[1].toLowerCase() : 'note';
    
    // Map Obsidian callout types to alert types
    const typeMap: Record<string, string> = {
      'note': 'primary',
      'abstract': 'secondary',
      'info': 'info',
      'success': 'success',
      'warning': 'warning',
      'error': 'danger',
      'tip': 'light',
      'quote': 'dark'
    };
    
    const alertType = typeMap[calloutType] || 'primary';
    i++;
    
    // Collect message lines
    const messageLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed.startsWith('>')) {
        break;
      }
      
      const content = trimmed.replace(/^>\s?/, '');
      if (content) {
        messageLines.push(content);
      }
      i++;
    }
    
    const message = messageLines.join('\n');
    
    return {
      block: {
        id: this.generateBlockId(),
        type: 'alert',
        data: {
          type: alertType,
          message: message,
          align: 'left'
        }
      },
      nextIndex: i
    };
  }
  
  /**
   * Parse button from Markdown link
   */
  private parseButton(text: string, link: string): OutputBlockData {
    return {
      id: this.generateBlockId(),
      type: 'button',
      data: {
        text: text,
        link: link
      }
    };
  }
  
  /**
   * Parse personality block from quote with attribution
   */
  private parsePersonality(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    let i = startIndex;
    let photo = '';
    let name = '';
    let description = '';
    let link = '';
    const textLines: string[] = [];
    
    // Check for image first
    if (lines[i].trim().match(/^!\[(.+?)\]\((.+?)\)$/)) {
      const imgMatch = lines[i].trim().match(/^!\[(.+?)\]\((.+?)\)$/);
      if (imgMatch) {
        name = imgMatch[1];
        photo = imgMatch[2];
        i++;
        
        // Skip empty line
        if (i < lines.length && !lines[i].trim()) {
          i++;
        }
      }
    }
    
    // Parse quote content
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed.startsWith('>')) {
        break;
      }
      
      const content = trimmed.replace(/^>\s?/, '');
      
      // Check for attribution line
      if (content.startsWith('—')) {
        const attrMatch = content.match(/^—\s*\*\*(.+?)\*\*(?:,\s*\*(.+?)\*)?/);
        if (attrMatch) {
          name = attrMatch[1];
          description = attrMatch[2] || '';
        }
      } else if (content.match(/^\[(.+?)\]\((.+?)\)$/)) {
        const linkMatch = content.match(/^\[(.+?)\]\((.+?)\)$/);
        if (linkMatch) {
          link = linkMatch[2];
        }
      } else if (content) {
        textLines.push(content);
      }
      
      i++;
    }
    
    return {
      block: {
        id: this.generateBlockId(),
        type: 'personality',
        data: {
          name: name,
          description: description,
          link: link,
          photo: photo,
          text: textLines.join('\n')
        }
      },
      nextIndex: i
    };
  }

  /**
   * Parse math block ($$...$$)
   */
  private parseMathBlock(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    let i = startIndex + 1; // Skip opening $$
    const mathLines: string[] = [];

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '$$') {
        i++;
        break;
      }
      mathLines.push(line);
      i++;
    }

    return {
      block: {
        id: this.generateBlockId(),
        type: 'math',
        data: {
          math: mathLines.join('\n')
        }
      },
      nextIndex: i
    };
  }
  
  /**
   * Parse toggle block (details/summary)
   */
  private parseToggleBlock(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    let i = startIndex;
    const firstLine = lines[i];
    
    // Check if open
    const isOpen = firstLine.includes('open');
    i++;
    
    // Parse summary
    let title = 'Toggle';
    if (i < lines.length && lines[i].trim().startsWith('<summary>')) {
      const summaryMatch = lines[i].match(/<summary>(.+?)<\/summary>/);
      if (summaryMatch) {
        title = summaryMatch[1];
      }
      i++;
    }
    
    // Skip empty line
    if (i < lines.length && !lines[i].trim()) {
      i++;
    }
    
    // Parse content
    const contentLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '</details>') {
        i++;
        break;
      }
      contentLines.push(line);
      i++;
    }
    
    return {
      block: {
        id: this.generateBlockId(),
        type: 'toggle',
        data: {
          title: title,
          text: contentLines.join('\n').trim(),
          status: isOpen ? 'open' : 'closed'
        }
      },
      nextIndex: i
    };
  }
  
  /**
   * Parse layout block (columns)
   */
  private parseLayoutBlock(lines: string[], startIndex: number): { block: OutputBlockData; nextIndex: number } {
    let i = startIndex + 1; // Skip <!-- columns -->
    
    // Skip empty line
    if (i < lines.length && !lines[i].trim()) {
      i++;
    }
    
    const columns: any[] = [];
    let currentColumn: string[] = [];
    
    while (i < lines.length) {
      const line = lines[i];
      
      if (line.trim() === '<!-- /columns -->') {
        // Save last column
        if (currentColumn.length > 0) {
          columns.push(currentColumn.join('\n'));
          currentColumn = [];
        }
        i++;
        break;
      }
      
      if (line.trim() === '<!-- column -->') {
        // Save previous column
        if (currentColumn.length > 0) {
          columns.push(currentColumn.join('\n'));
          currentColumn = [];
        }
        i++;
        // Skip empty line
        if (i < lines.length && !lines[i].trim()) {
          i++;
        }
        continue;
      }
      
      currentColumn.push(line);
      i++;
    }
    
    // Convert columns to layout format
    const itemContent: any = {};
    const children: any[] = [];
    
    columns.forEach((col, index) => {
      const colId = `col-${index}`;
      // Parse column content as blocks
      const colBlocks = this.convert(col);
      itemContent[colId] = colBlocks;
      
      // Add child to layout structure
      children.push({
        type: 'item',
        id: colId,
        className: '',
        style: `width: ${Math.floor(100 / columns.length)}%`,
        children: []
      });
    });
    
    return {
      block: {
        id: this.generateBlockId(),
        type: 'layout',
        data: {
          itemContent: itemContent,
          layout: {
            type: 'container',
            id: '',
            className: '',
            style: '',
            children: children
          }
        }
      },
      nextIndex: i
    };
  }
  
  /**
   * Parse footnote reference
   */
  private parseFootnote(text: string): { text: string; footnotes: Array<{id: string; content: string}> } {
    const footnotes: Array<{id: string; content: string}> = [];
    
    // Extract footnote references [^1]
    const refPattern = /\[\^(\w+)\]/g;
    const refs = [...text.matchAll(refPattern)];
    
    refs.forEach(match => {
      footnotes.push({
        id: match[1],
        content: ''
      });
    });
    
    return { text, footnotes };
  }

  /**
   * Generate unique block ID
   */
  private generateBlockId(): string {
    return `block-${Date.now()}-${this.blockIdCounter++}`;
  }
}
