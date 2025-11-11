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

    // Join blocks with double newline for proper Markdown spacing
    // This is required for proper rendering of tables, lists, etc.
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
      case 'simpleImage':
        return this.convertSimpleImage(block);
      case 'linkTool':
        return this.convertLinkTool(block);
      case 'delimiter':
        return this.convertDelimiter(block);
      case 'warning':
        return this.convertWarning(block);
      case 'raw':
        return this.convertRaw(block);
      case 'embed':
        return this.convertEmbed(block);
      case 'attaches':
        return this.convertAttaches(block);
      case 'alert':
        return this.convertAlert(block);
      case 'button':
        return this.convertButton(block);
      case 'personality':
        return this.convertPersonality(block);
      case 'footnotes':
        return this.convertFootnotes(block);
      case 'toggle':
        return this.convertToggle(block);
      case 'math':
        return this.convertMath(block);
      case 'layout':
        return this.convertLayout(block);
      default:
        // Unsupported block type - convert to paragraph with warning
        return this.convertUnsupportedBlock(block);
    }
  }

  /**
   * Convert header block to Markdown heading
   * Restore Obsidian wikilinks and decode HTML entities
   */
  private convertHeader(block: OutputBlockData): string {
    const level = block.data.level || 1;
    let text = block.data.text || '';
    
    // Decode HTML entities
    text = this.decodeHtmlEntities(text);
    
    // Handle Obsidian embed syntax ![[link]]
    // Match both with and without class attribute
    text = text.replace(/!<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>\1<\/a>/g, (_match: string, link: string) => {
      const decodedLink = this.decodeHtmlEntities(link);
      return `![[${decodedLink}]]`;
    });
    
    // Convert HTML links back to Obsidian wikilinks
    // Match both with and without class attribute
    text = text.replace(/<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>([^<]+)<\/a>/g, (_match: string, link: string, display: string) => {
      const decodedLink = this.decodeHtmlEntities(link);
      const decodedDisplay = this.decodeHtmlEntities(display);
      if (decodedLink === decodedDisplay) {
        return `[[${decodedLink}]]`;
      }
      return `[[${decodedLink}|${decodedDisplay}]]`;
    });
    
    const hashes = '#'.repeat(Math.min(Math.max(level, 1), 6));
    return `${hashes} ${text}`;
  }

  /**
   * Convert paragraph block to plain text
   * Restore Obsidian-specific syntax and decode HTML entities
   */
  private convertParagraph(block: OutputBlockData): string {
    let text = block.data.text || '';
    
    // Decode HTML entities first
    text = this.decodeHtmlEntities(text);
    
    // Handle Obsidian embed syntax ![[link]] first (before regular wikilinks)
    // Match both with and without class attribute
    text = text.replace(/!<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>\1<\/a>/g, (_match: string, link: string) => {
      const decodedLink = this.decodeHtmlEntities(link);
      return `![[${decodedLink}]]`;
    });
    
    // Convert HTML links back to Obsidian wikilinks
    // <a href="link" class="obsidian-link">display</a> -> [[link|display]]
    // Match both with and without class attribute
    text = text.replace(/<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>([^<]+)<\/a>/g, (_match: string, link: string, display: string) => {
      const decodedLink = this.decodeHtmlEntities(link);
      const decodedDisplay = this.decodeHtmlEntities(display);
      if (decodedLink === decodedDisplay) {
        return `[[${decodedLink}]]`;
      }
      return `[[${decodedLink}|${decodedDisplay}]]`;
    });
    
    // Also handle regular links that might be Obsidian internal links
    text = text.replace(/<a\s+href="([^"]+)">([^<]+)<\/a>/g, (match: string, link: string, display: string) => {
      // If link doesn't start with http/https, treat as internal Obsidian link
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        const decodedLink = this.decodeHtmlEntities(link);
        const decodedDisplay = this.decodeHtmlEntities(display);
        if (decodedLink === decodedDisplay) {
          return `[[${decodedLink}]]`;
        }
        return `[[${decodedLink}|${decodedDisplay}]]`;
      }
      return match; // Keep external links as-is
    });
    
    return text;
  }
  
  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' '
    };
    
    let decoded = text;
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), char);
    }
    
    return decoded;
  }

  /**
   * Convert list block to Markdown list
   * Restore Obsidian wikilinks
   * Handles both NestedList format (objects with content) and simple string arrays
   */
  private convertList(block: OutputBlockData): string {
    const style = block.data.style || 'unordered';
    const items = block.data.items || [];
    
    return this.convertListItems(items, style, 0);
  }

  /**
   * Convert checklist block to Markdown task list
   * Restore Obsidian wikilinks and decode HTML entities
   */
  private convertChecklist(block: OutputBlockData): string {
    const items = block.data.items || [];
    const lines: string[] = [];

    items.forEach((item: any) => {
      const checked = item.checked ? 'x' : ' ';
      let text = String(item.text || '');
      
      // Decode HTML entities
      text = this.decodeHtmlEntities(text);
      
      // Handle Obsidian embed syntax ![[link]]
      // Match both with and without class attribute
      text = text.replace(/!<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>\1<\/a>/g, (_match: string, link: string) => {
        const decodedLink = this.decodeHtmlEntities(link);
        return `![[${decodedLink}]]`;
      });
      
      // Convert HTML links back to Obsidian wikilinks
      // Match both with and without class attribute
      text = text.replace(/<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>([^<]+)<\/a>/g, (_match: string, link: string, display: string) => {
        const decodedLink = this.decodeHtmlEntities(link);
        const decodedDisplay = this.decodeHtmlEntities(display);
        if (decodedLink === decodedDisplay) {
          return `[[${decodedLink}]]`;
        }
        return `[[${decodedLink}|${decodedDisplay}]]`;
      });
      
      lines.push(`- [${checked}] ${text}`);
    });

    return lines.join('\n');
  }

  /**
   * Convert list items recursively (handles nesting)
   * Restore Obsidian wikilinks and decode HTML entities
   */
  private convertListItems(items: any[], style: string, level: number): string {
    const lines: string[] = [];
    const indent = '    '.repeat(level); // 4 spaces per level

    // Filter out undefined/null items
    const validItems = items.filter(item => item !== undefined && item !== null);

    validItems.forEach((item, index) => {
      const marker = style === 'ordered' ? `${index + 1}.` : '-';
      
      // Handle different item formats (NestedList uses objects with content property)
      let content = '';
      if (typeof item === 'string') {
        content = item;
      } else if (typeof item === 'object') {
        content = item.content || item.text || '';
      }
      
      // Ensure content is a string
      content = String(content);
      
      // Decode HTML entities
      let decodedContent = this.decodeHtmlEntities(content);
      
      // Handle Obsidian embed syntax ![[link]] (match anywhere in content)
      // Match both with and without class attribute
      decodedContent = decodedContent.replace(/!<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>\1<\/a>/g, (_match: string, link: string) => {
        const decodedLink = this.decodeHtmlEntities(link);
        return `![[${decodedLink}]]`;
      });
      
      // Convert HTML links back to Obsidian wikilinks
      // Match both with and without class attribute
      decodedContent = decodedContent.replace(/<a\s+href="([^"]+)"(?:\s+class="[^"]*")?>([^<]+)<\/a>/g, (_match: string, link: string, display: string) => {
        const decodedLink = this.decodeHtmlEntities(link);
        const decodedDisplay = this.decodeHtmlEntities(display);
        if (decodedLink === decodedDisplay) {
          return `[[${decodedLink}]]`;
        }
        return `[[${decodedLink}|${decodedDisplay}]]`;
      });
      
      // Output the list item with proper indentation
      lines.push(`${indent}${marker} ${decodedContent}`);

      // Handle nested items recursively
      if (typeof item === 'object' && item.items && Array.isArray(item.items) && item.items.length > 0) {
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
   * Convert table block to Markdown table (Obsidian compatible)
   */
  private convertTable(block: OutputBlockData): string {
    const content = block.data.content || [];
    const withHeadings = block.data.withHeadings !== false;

    if (content.length === 0) {
      return '';
    }

    const lines: string[] = [];

    // Ensure all rows have the same number of columns
    const maxCols = Math.max(...content.map((row: any[]) => Array.isArray(row) ? row.length : 0));

    // Process each row
    content.forEach((row: string[], index: number) => {
      const cells = Array.isArray(row) ? row : [];
      // Pad cells to match maxCols
      const paddedCells = [...cells];
      while (paddedCells.length < maxCols) {
        paddedCells.push('');
      }
      
      // Escape pipe characters in cell content
      const escapedCells = paddedCells.map(cell => 
        String(cell || '').replace(/\|/g, '\\|')
      );
      
      const rowText = `| ${escapedCells.join(' | ')} |`;
      lines.push(rowText);

      // Add separator after first row (Obsidian/Markdown tables always need separator)
      if (index === 0) {
        const separator = `| ${paddedCells.map(() => '---').join(' | ')} |`;
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
   * Convert simpleImage block to Markdown image syntax
   */
  private convertSimpleImage(block: OutputBlockData): string {
    const url = block.data.url || '';
    const caption = block.data.caption || '';
    
    return `![${caption}](${url})`;
  }

  /**
   * Convert linkTool block to Obsidian-compatible format
   * Store as JSON in HTML comment to preserve all metadata
   */
  private convertLinkTool(block: OutputBlockData): string {
    const link = block.data.link || '';
    const meta = block.data.meta || {};
    const title = meta.title || link;
    const description = meta.description || '';
    const image = meta.image?.url || '';
    
    // Store complete data in HTML comment for lossless round-trip
    const jsonData = JSON.stringify({
      type: 'linkTool',
      data: block.data
    });
    
    // Format as a link with optional description
    let result = `[${title}](${link})`;
    if (description) {
      result += `\n\n> ${description}`;
    }
    if (image) {
      result += `\n\n![](${image})`;
    }
    
    // Add JSON data comment for lossless conversion
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }
  
  /**
   * Escape content for HTML comments
   */
  private escapeHtmlComment(str: string): string {
    return str.replace(/--/g, '&#45;&#45;');
  }
  
  /**
   * Unescape content from HTML comments
   */
  private unescapeHtmlComment(str: string): string {
    return str.replace(/&#45;&#45;/g, '--');
  }

  /**
   * Convert delimiter block to Markdown horizontal rule
   */
  private convertDelimiter(block: OutputBlockData): string {
    return '---';
  }

  /**
   * Convert warning block to Markdown blockquote with warning prefix
   */
  private convertWarning(block: OutputBlockData): string {
    const title = block.data.title || '';
    const message = block.data.message || '';
    
    const lines: string[] = [];
    if (title) {
      lines.push(`> ⚠️ **${title}**`);
    }
    if (message) {
      lines.push(`> ${message}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Convert raw HTML block to Markdown (preserve as-is)
   */
  private convertRaw(block: OutputBlockData): string {
    const html = block.data.html || '';
    // Wrap in HTML comment to preserve it
    return `<!-- raw-html -->\n${html}\n<!-- /raw-html -->`;
  }

  /**
   * Convert embed block to Obsidian-compatible format
   * Use Obsidian's iframe syntax for embeds
   */
  private convertEmbed(block: OutputBlockData): string {
    const service = block.data.service || '';
    const source = block.data.source || '';
    const embed = block.data.embed || '';
    const caption = block.data.caption || '';
    const width = block.data.width || '';
    const height = block.data.height || '';
    
    const url = embed || source;
    
    // Store complete data for lossless conversion
    const jsonData = JSON.stringify({
      type: 'embed',
      data: block.data
    });
    
    // Use Obsidian iframe syntax for better compatibility
    let result = `<iframe src="${url}" width="${width || '100%'}" height="${height || '400'}" frameborder="0" allowfullscreen></iframe>`;
    
    if (caption) {
      result += `\n\n*${caption}*`;
    }
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }

  /**
   * Convert attaches block to Obsidian-compatible format
   */
  private convertAttaches(block: OutputBlockData): string {
    const file = block.data.file || {};
    const url = file.url || '';
    const title = block.data.title || file.name || 'attachment';
    const size = file.size || 0;
    const extension = file.extension || '';
    
    // Store complete data
    const jsonData = JSON.stringify({
      type: 'attaches',
      data: block.data
    });
    
    // Use Obsidian link syntax with attachment indicator
    let result = `[📎 ${title}](${url})`;
    
    if (size) {
      const sizeKB = Math.round(size / 1024);
      result += ` *(${sizeKB} KB)*`;
    }
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }

  /**
   * Convert alert block to Obsidian callout format
   */
  private convertAlert(block: OutputBlockData): string {
    const type = block.data.type || 'info';
    const message = block.data.message || '';
    const align = block.data.align || 'left';
    
    // Map alert types to Obsidian callout types
    const calloutMap: Record<string, string> = {
      'primary': 'note',
      'secondary': 'abstract',
      'info': 'info',
      'success': 'success',
      'warning': 'warning',
      'danger': 'error',
      'light': 'tip',
      'dark': 'quote'
    };
    
    const calloutType = calloutMap[type] || 'note';
    
    // Store complete data for lossless conversion
    const jsonData = JSON.stringify({
      type: 'alert',
      data: block.data
    });
    
    let result = `> [!${calloutType}]\n> ${message}`;
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }
  
  /**
   * Convert button block to Markdown link with button indicator
   */
  private convertButton(block: OutputBlockData): string {
    const text = block.data.text || 'Button';
    const link = block.data.link || '#';
    
    // Store complete data
    const jsonData = JSON.stringify({
      type: 'button',
      data: block.data
    });
    
    let result = `[🔘 ${text}](${link})`;
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }
  
  /**
   * Convert personality block to Markdown quote with attribution
   */
  private convertPersonality(block: OutputBlockData): string {
    const name = block.data.name || '';
    const description = block.data.description || '';
    const link = block.data.link || '';
    const photo = block.data.photo || '';
    const text = block.data.text || '';
    
    // Store complete data
    const jsonData = JSON.stringify({
      type: 'personality',
      data: block.data
    });
    
    let result = '';
    
    if (photo) {
      result += `![${name}](${photo})\n\n`;
    }
    
    result += `> ${text}\n>\n> — **${name}**`;
    
    if (description) {
      result += `, *${description}*`;
    }
    
    if (link) {
      result += `\n>\n> [${link}](${link})`;
    }
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }

  /**
   * Convert footnotes block to Markdown footnote reference
   */
  private convertFootnotes(block: OutputBlockData): string {
    const text = block.data.text || '';
    const footnote = block.data.footnote || '';
    const id = block.data.id || '1';
    
    // Store complete data
    const jsonData = JSON.stringify({
      type: 'footnotes',
      data: block.data
    });
    
    let result = `${text}[^${id}]\n\n[^${id}]: ${footnote}`;
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }
  
  /**
   * Convert toggle block to Obsidian details/summary format
   */
  private convertToggle(block: OutputBlockData): string {
    const title = block.data.title || 'Toggle';
    const text = block.data.text || '';
    const status = block.data.status || 'closed';
    
    // Store complete data
    const jsonData = JSON.stringify({
      type: 'toggle',
      data: block.data
    });
    
    // Use HTML details/summary for toggle
    let result = `<details${status === 'open' ? ' open' : ''}>\n<summary>${title}</summary>\n\n${text}\n</details>`;
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }
  
  /**
   * Convert math block to LaTeX format
   */
  private convertMath(block: OutputBlockData): string {
    const math = block.data.math || '';
    
    // Store complete data
    const jsonData = JSON.stringify({
      type: 'math',
      data: block.data
    });
    
    // Use Obsidian math block format
    let result = `$$\n${math}\n$$`;
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
  }
  
  /**
   * Convert layout block to Markdown columns
   */
  private convertLayout(block: OutputBlockData): string {
    const layout = block.data.layout || {};
    const itemContent = block.data.itemContent || {};
    
    // Store complete data
    const jsonData = JSON.stringify({
      type: 'layout',
      data: block.data
    });
    
    // Convert to simple column format
    let result = '<!-- columns -->\n\n';
    
    Object.keys(itemContent).forEach((key) => {
      const content = itemContent[key];
      if (content && content.blocks) {
        result += '<!-- column -->\n\n';
        content.blocks.forEach((subBlock: any) => {
          // Recursively convert sub-blocks
          const converted = this.convertBlock(subBlock);
          if (converted) {
            result += converted + '\n\n';
          }
        });
      }
    });
    
    result += '<!-- /columns -->';
    
    // Add JSON data comment
    result += `\n<!-- editorjs-data: ${this.escapeHtmlComment(jsonData)} -->`;
    
    return result;
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
