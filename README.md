# Obsidian Editor.js Plugin

A block-based rich text editor powered by Editor.js for Obsidian.

## Features

- **Dual View Modes**: Switch between traditional Markdown and modern block-based editing
- **Block Editor**: Intuitive block-based editing similar to Notion
- **Markdown Compatible**: All edits are saved as standard Markdown
- **Rich Tools**: Support for headers, lists, tables, images, code blocks, and quotes
- **Theme Support**: Automatically adapts to Obsidian's light and dark themes
- **Auto-save**: Configurable automatic saving
- **Performance**: Virtual scrolling for large documents

## Installation

### Manual Installation

1. Download the latest release from the releases page
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-editorjs-plugin/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Development Installation

1. Clone this repository into your vault's plugins folder
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Reload Obsidian
5. Enable the plugin in Settings → Community Plugins

## Usage

### Switching Views

- **To Rich Text View**: Right-click on a file → "Open as Rich Text View"
- **To Markdown View**: Right-click on a file → "Open as Markdown"
- Or use the command palette (Ctrl/Cmd + P) and search for "Open as Rich Text View" or "Open as Markdown"

### Editing in Rich Text View

- Press `Enter` to create a new block
- Press `Backspace` on an empty block to delete it
- Type `/` to open the block type menu
- Drag the handle on the left to reorder blocks
- Use the toolbar for inline formatting

### Supported Block Types

- **Header**: H1-H6 headings
- **Paragraph**: Regular text
- **List**: Ordered and unordered lists
- **Table**: Markdown tables
- **Image**: Upload and embed images
- **Code**: Code blocks with syntax highlighting
- **Quote**: Block quotes

## Configuration

Access plugin settings via Settings → Editor.js Plugin:

- **Auto-save interval**: Time between automatic saves (default: 30 seconds)
- **Image folder**: Where to store uploaded images (default: attachments)
- **Default view mode**: Choose Markdown or Rich Text as default
- **Editor theme**: Light, dark, or auto (follows Obsidian)
- **Enable backup**: Create backups before saving
- **Virtual scrolling**: Enable for large documents
- **Enabled tools**: Choose which Editor.js tools to enable

## Common Issues

### Conversion Failures

If a Markdown file fails to convert to rich text:
- Check the console for error messages (Ctrl/Cmd + Shift + I)
- The file may contain unsupported Markdown syntax
- Unsupported syntax will be converted to plain text blocks with warnings
- Try opening in Markdown view and simplifying the content
- If issues persist, try "Reset Plugin" in settings

### Image Path Issues

If images don't display:
- Ensure the image folder path is correct in settings
- Check that images are stored in the vault
- Use relative paths in Markdown
- Remote images will be downloaded to local storage
- Verify the attachments folder has write permissions

### Performance Issues

For large documents:
- Enable virtual scrolling in settings
- Adjust the virtual scrolling threshold (default: 500 blocks)
- Consider splitting very large files
- Disable unused tools in settings to reduce overhead

### Plugin Conflicts

If experiencing conflicts with other plugins:
- All styles use `.obsidian-editorjs-plugin` namespace for isolation
- Check if other plugins modify Markdown views
- Try disabling other plugins one by one to identify conflicts
- Report compatibility issues on GitHub

### Data Safety

Regarding data integrity:
- Plugin creates backups before saving (if enabled in settings)
- Files remain standard Markdown format
- You can always switch back to Markdown view to see raw content
- Regular vault backups are recommended

## Development

### Building

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Project Structure

```
obsidian-editorjs-plugin/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── settings/
│   │   ├── SettingsManager.ts  # Settings management
│   │   └── SettingsTab.ts      # Settings UI
│   ├── views/                  # View implementations (future)
│   ├── converters/             # Markdown ↔ JSON converters (future)
│   ├── editor/                 # Editor.js integration (future)
│   └── storage/                # File management (future)
├── manifest.json               # Plugin manifest
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── rollup.config.js            # Build config
└── styles.css                  # Plugin styles
```

## License

MIT

## Credits

- Built with [Editor.js](https://editorjs.io/)
- For [Obsidian](https://obsidian.md/)

## Support

If you encounter issues or have suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contribute improvements via pull requests
