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
      tsconfig: './tsconfig.json'
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    isProd && terser()
  ].filter(Boolean)
};
