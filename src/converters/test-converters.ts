/**
 * Simple test file to verify converter functionality
 * Run this to test round-trip conversion
 */

import { MarkdownToBlocks } from './MarkdownToBlocks';
import { BlocksToMarkdown } from './BlocksToMarkdown';

// Test markdown samples
const testMarkdown = `# Heading 1

This is a paragraph.

## Heading 2

- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
- Item 3

1. First
2. Second
3. Third

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> This is a quote
> with multiple lines

| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Cell 1 | Cell 2 | Cell 3 |
| Cell 4 | Cell 5 | Cell 6 |

![Image caption](path/to/image.png)`;

// Test converters
function testConverters() {
  console.log('=== Testing Markdown to Blocks ===');
  const mdToBlocks = new MarkdownToBlocks();
  const blocks = mdToBlocks.convert(testMarkdown);
  
  console.log('Blocks generated:', blocks.blocks.length);
  console.log(JSON.stringify(blocks, null, 2));
  
  console.log('\n=== Testing Blocks to Markdown ===');
  const blocksToMd = new BlocksToMarkdown();
  const markdown = blocksToMd.convert(blocks);
  
  console.log('Markdown output:');
  console.log(markdown);
  
  console.log('\n=== Testing Round-trip Consistency ===');
  const blocks2 = mdToBlocks.convert(markdown);
  const markdown2 = blocksToMd.convert(blocks2);
  
  console.log('Round-trip successful:', markdown === markdown2);
  if (markdown !== markdown2) {
    console.log('\nOriginal:');
    console.log(markdown);
    console.log('\nAfter round-trip:');
    console.log(markdown2);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testConverters();
}

export { testConverters };
