import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const production = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.js',
  output: {
    file: 'assets/js/bundle.js',
    format: 'iife',
    sourcemap: !production,
    name: 'portfolio'
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    production && terser()
  ]
};
