# Markdown ⇄ Editor.js Converters

This module provides bidirectional conversion between Markdown text and Editor.js block format.

## Features

- **CommonMark Compliant**: Follows CommonMark specification for Markdown parsing
- **Round-trip Consistency**: Markdown → JSON → Markdown maintains content integrity
- **Comprehensive Support**: Handles all major Markdown elements
- **Graceful Degradation**: Unsupported syntax converts to plain text with warnings

## Supported Elements

### MarkdownToBlocks

Converts Markdown to Editor.js JSON format:

| Markdown Element | Editor.js Block Type | Notes |
|-----------------|---------------------|-------|
| `# - ######` | `header` | Levels 1-6 |
| Plain text | `paragraph` | Default block type |
| `- ` or `* ` or `+ ` | `list` (unordered) | Supports nesting |
| `1. ` | `list` (ordered) | Supports nesting |
| ` ``` ` | `code` | Preserves language identifier |
| `> ` | `quote` | Multi-line support |
| `\| ... \|` | `table` | With header row |
| `![alt](url)` | `image` | Extracts caption and URL |

### BlocksToMarkdown

Converts Editor.js JSON to Markdown:

| Block Type | Markdown Output | Notes |
|-----------|----------------|-------|
| `header` | `# - ######` | Based on level |
| `paragraph` | Plain text | Direct conversion |
| `list` | `- ` or `1. ` | Maintains nesting |
| `code` | ` ``` ` | Includes language |
| `quote` | `> ` | Multi-line preserved |
| `table` | `\| ... \|` | With separator row |
| `image` | `![alt](url)` | Relative paths |
| Unknown | Plain text | Graceful fallback |

## Usage

### Basic Conversion

```typescript
import { MarkdownToBlocks, BlocksToMarkdown } from './converters';

// Markdown to Blocks
const mdToBlocks = new MarkdownToBlocks();
const blocks = mdToBlocks.convert('# Hello World\n\nThis is a paragraph.');

// Blocks to Markdown
const blocksToMd = new BlocksToMarkdown();
const markdown = blocksToMd.convert(blocks);
```

### Round-trip Conversion

```typescript
const original = '# Title\n\n- Item 1\n- Item 2';

const mdToBlocks = new MarkdownToBlocks();
const blocksToMd = new BlocksToMarkdown();

// Convert to blocks and back
const blocks = mdToBlocks.convert(original);
const result = blocksToMd.convert(blocks);

// result should equal original (with normalized formatting)
```

## Implementation Details

### MarkdownToBlocks

**Key Methods:**
- `convert(markdown: string): OutputData` - Main conversion method
- `parseHeading(line: string)` - Parses # headings
- `parseParagraph(line: string)` - Converts plain text
- `parseList(lines: string[], startIndex: number)` - Handles nested lists
- `parseCodeBlock(lines: string[], startIndex: number)` - Extracts code blocks
- `parseQuote(lines: string[], startIndex: number)` - Processes blockquotes
- `parseTable(lines: string[], startIndex: number)` - Parses table syntax
- `parseImage(line: string)` - Extracts image references

**Algorithm:**
1. Split markdown into lines
2. Iterate through lines sequentially
3. Match patterns for each block type
4. Handle multi-line blocks (code, quote, table, list)
5. Generate unique block IDs
6. Return OutputData structure

### BlocksToMarkdown

**Key Methods:**
- `convert(data: OutputData): string` - Main conversion method
- `convertHeader(block)` - Generates # syntax
- `convertParagraph(block)` - Plain text output
- `convertList(block)` - Recursive list rendering
- `convertCode(block)` - Code fence generation
- `convertQuote(block)` - Blockquote formatting
- `convertTable(block)` - Table syntax with separators
- `convertImage(block)` - Image link generation

**Algorithm:**
1. Iterate through blocks array
2. Convert each block based on type
3. Join blocks with double newlines
4. Return formatted markdown string

## Edge Cases Handled

### Nested Lists
```markdown
- Item 1
  - Nested 1
  - Nested 2
- Item 2
```

### Multi-line Quotes
```markdown
> Line 1
> Line 2
> Line 3
```

### Code Blocks with Language
```markdown
\`\`\`javascript
const x = 1;
\`\`\`
```

### Tables with Headers
```markdown
| Col 1 | Col 2 |
| --- | --- |
| A | B |
```

### Empty Lines
Empty lines between blocks are preserved for readability.

## Testing

Run the test file to verify functionality:

```bash
npm run test:converters
```

Or manually test with:

```typescript
import { testConverters } from './test-converters';
testConverters();
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **3.1**: Reads Markdown and parses to Editor.js blocks
- **3.2**: Supports all major Markdown elements
- **3.3**: Handles unsupported syntax gracefully
- **3.4**: Preserves semantic structure
- **4.1**: Converts blocks to CommonMark-compliant Markdown
- **4.2**: Ensures round-trip consistency

## Future Enhancements

Potential improvements:
- Support for custom block types
- HTML passthrough handling
- Advanced table features (alignment, merged cells)
- Footnotes and references
- Task lists (`- [ ]` and `- [x]`)
- Definition lists
