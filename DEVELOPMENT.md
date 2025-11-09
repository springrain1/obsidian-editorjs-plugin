# Development Guide

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Plugin**
   ```bash
   npm run build
   ```

3. **Development Mode** (auto-rebuild on changes)
   ```bash
   npm run dev
   ```

## Project Structure

```
obsidian-editorjs-plugin/
├── src/
│   ├── main.ts                    # Plugin entry point
│   ├── settings/
│   │   ├── SettingsManager.ts     # Settings persistence
│   │   └── SettingsTab.ts         # Settings UI
│   ├── editorjs/
│   │   ├── types/                 # Editor.js type definitions
│   │   └── index.d.ts             # Type exports
│   ├── views/                     # (Future) View implementations
│   ├── converters/                # (Future) Markdown ↔ JSON
│   ├── editor/                    # (Future) Editor.js integration
│   └── storage/                   # (Future) File management
├── manifest.json                  # Plugin metadata
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
├── rollup.config.js               # Build configuration
├── styles.css                     # Plugin styles
└── README.md                      # User documentation
```

## Current Implementation Status

### ✅ Completed (Task 1)

- [x] Plugin infrastructure setup
- [x] Manifest.json configuration
- [x] Package.json with dependencies
- [x] TypeScript configuration
- [x] Rollup build configuration
- [x] Main plugin class (ObsidianEditorJSPlugin)
- [x] Settings management system
- [x] Settings UI tab
- [x] Editor.js type definitions copied
- [x] Basic styling framework
- [x] Documentation (README, DEVELOPMENT)

### 🔄 Pending (Future Tasks)

- [ ] Markdown to Editor.js JSON converter
- [ ] Editor.js JSON to Markdown converter
- [ ] EditorJS view implementation
- [ ] File management and auto-save
- [ ] View switching commands
- [ ] Image handling
- [ ] Theme adaptation
- [ ] Error handling

## Building

The build process uses Rollup to bundle the TypeScript code:

```bash
# Production build (minified)
npm run build

# Development build (with source maps, watch mode)
npm run dev
```

Output: `main.js` in the root directory

## Testing in Obsidian

1. Build the plugin: `npm run build`
2. Copy the plugin folder to your vault:
   ```
   <vault>/.obsidian/plugins/obsidian-editorjs-plugin/
   ```
3. Ensure these files are present:
   - `main.js`
   - `manifest.json`
   - `styles.css`
4. Reload Obsidian (Ctrl/Cmd + R)
5. Enable the plugin in Settings → Community Plugins

## Dependencies

### Runtime Dependencies
- `@editorjs/editorjs` - Core Editor.js library
- `@editorjs/header` - Header block tool
- `@editorjs/list` - List block tool
- `@editorjs/table` - Table block tool
- `@editorjs/image` - Image block tool
- `@editorjs/code` - Code block tool
- `@editorjs/quote` - Quote block tool

### Development Dependencies
- `obsidian` - Obsidian API types
- `typescript` - TypeScript compiler
- `rollup` - Module bundler
- `@rollup/plugin-typescript` - TypeScript plugin
- `@rollup/plugin-node-resolve` - Node module resolution
- `@rollup/plugin-commonjs` - CommonJS module support
- `rollup-plugin-terser` - Code minification

## Configuration Files

### tsconfig.json
- Target: ES2018
- Module: ESNext
- Strict mode enabled
- Source maps enabled
- Path aliases configured

### rollup.config.js
- Entry: `src/main.ts`
- Output: `main.js` (CommonJS format)
- External: Obsidian API modules
- Plugins: TypeScript, Node Resolve, CommonJS, Terser

## Code Style

- Use TypeScript strict mode
- Follow Obsidian plugin conventions
- Document public APIs with JSDoc comments
- Use meaningful variable and function names
- Keep functions focused and small

## Next Steps

To continue development, implement the remaining tasks in order:

1. **Task 2**: Markdown ⇄ Editor.js JSON converters
2. **Task 3**: EditorJS view and file management
3. **Task 4**: View switching and final integration

See `.kiro/specs/obsidian-editorjs-plugin/tasks.md` for detailed task descriptions.

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Ensure TypeScript version matches (5.0.3)

### Type Errors

If you see type errors related to Obsidian:
1. Ensure `obsidian` package is installed
2. Check that `tsconfig.json` includes proper paths
3. Restart your IDE/editor

### Plugin Not Loading

If the plugin doesn't load in Obsidian:
1. Check the console for errors (Ctrl/Cmd + Shift + I)
2. Verify `manifest.json` is valid JSON
3. Ensure `main.js` exists and is not empty
4. Check that `minAppVersion` in manifest matches your Obsidian version

## Resources

- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Editor.js Documentation](https://editorjs.io/)
- [Editor.js API Reference](https://editorjs.io/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
