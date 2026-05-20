import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const isProd = process.env.BUILD === 'production';

// Plugin to remove ALL dynamic script creation from dependencies
function removeScriptInjection() {
  return {
    name: 'remove-script-injection',
    transform(code, id) {
      // Skip if not a JS file
      if (!id.endsWith('.js') && !id.endsWith('.mjs')) return null;
      
      let modified = false;
      let newCode = code;
      
      // Pattern 1: Direct createElement("script") or createElement('script')
      if (newCode.includes('createElement("script")') || newCode.includes("createElement('script')")) {
        newCode = newCode.replace(/\.createElement\(["']script["']\)/g, '.createElement("div")');
        modified = true;
      }
      
      // Pattern 2: createElement with variable that equals "script"
      if (newCode.match(/createElement\([a-zA-Z_$][a-zA-Z0-9_$]*\)/)) {
        // Replace patterns like: var t = "script"; createElement(t)
        newCode = newCode.replace(/=\s*["']script["']\s*[;,]/g, '="div";');
        modified = true;
      }
      
      // Pattern 3: Complex setImmediate polyfill patterns
      if (newCode.includes('onreadystatechange')) {
        // Replace the entire setImmediate polyfill block
        newCode = newCode.replace(
          /u&&"onreadystatechange"in u\.createElement\("script"\)\?[^:]+:[^}]+setTimeout[^}]+\}/g,
          'o=function(e){setTimeout(f,0,e)}'
        );
        modified = true;
      }
      
      // Pattern 4: Any remaining script element creation patterns
      // Match: document.createElement("script") or doc.createElement("script")
      newCode = newCode.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\.createElement\(\s*["']script["']\s*\)/g,
        '$1.createElement("div")'
      );
      
      // Pattern 5: String concatenation or template patterns
      newCode = newCode.replace(
        /["']<script[^>]*>.*?<\/script>["']/gi,
        '""'
      );
      
      // Pattern 6: Script tag in HTML strings
      newCode = newCode.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      );
      
      if (modified) {
        return { code: newCode, map: null };
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
        keep_fnames: false,
      },
      compress: {
        drop_console: false,
        drop_debugger: true,
        // Additional compression to remove dead code
        dead_code: true,
        unused: true,
      },
      format: {
        comments: false,
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
