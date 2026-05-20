import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { createFilter } from '@rollup/pluginutils';

const isProd = process.env.BUILD === 'production';

// Plugin to remove dynamic script creation from polyfills
function removeScriptInjection() {
  const filter = createFilter('**/*.js', 'node_modules/@types/**');
  
  return {
    name: 'remove-script-injection',
    transform(code, id) {
      if (!filter(id)) return null;
      
      // Replace setImmediate polyfill that creates script elements
      // This is safe in Electron/Obsidian environment which has native setImmediate
      if (code.includes('createElement("script")')) {
        // Replace the polyfill with a simple setTimeout-based implementation
        code = code.replace(
          /u&&"onreadystatechange"in u\.createElement\("script"\)\?\(i=u\.documentElement,o=function\(e\)\{var t=u\.createElement\("script"\);[^}]+\}\):o=function\(e\)\{setTimeout\(f,0,e\)\}/g,
          'o=function(e){setTimeout(f,0,e)}'
        );
        
        // Also handle variations of the pattern
        code = code.replace(
          /\.createElement\(['"]script['"]\)/g,
          '.createElement("div")'
        );
        
        return { code, map: null };
      }
      
      return null;
    }
  };
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: isProd ? false : 'inline',
    format: 'cjs',
    exports: 'default',
    file: 'main.js'
  },
  external: [
    'obsidian',
    'electron',
    '@codemirror/state',
    '@codemirror/view'
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !isProd,
      inlineSources: !isProd
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    removeScriptInjection(),
    isProd && terser({
      mangle: {
        // Preserve function names that might be checked by Obsidian
        keep_fnames: false,
      },
      compress: {
        // Remove console logs in production
        drop_console: false,
        // Remove debugger statements
        drop_debugger: true,
      }
    })
  ].filter(Boolean),
  onwarn(warning, warn) {
    // Suppress eval warnings from third-party plugins
    if (warning.code === 'EVAL') {
      const id = warning.id || '';
      if (id.includes('editorjs-button') || id.includes('editorjs-hyperlink')) {
        return;
      }
    }
    
    // Suppress TypeScript warnings from @editorjs/footnotes
    if (warning.plugin === 'typescript') {
      const loc = warning.loc || {};
      const file = loc.file || warning.id || '';
      if (file.includes('@editorjs/footnotes') || file.includes('node_modules/@editorjs/footnotes')) {
        return;
      }
    }
    
    // Suppress plugin-specific warnings from third-party code
    if (warning.pluginCode && warning.id) {
      if (warning.id.includes('node_modules/@editorjs/footnotes')) {
        return;
      }
    }
    
    // Use default for everything else
    warn(warning);
  }
};
