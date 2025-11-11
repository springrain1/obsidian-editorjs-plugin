import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const isProd = process.env.BUILD === 'production';

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
    isProd && terser()
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
