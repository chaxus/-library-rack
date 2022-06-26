import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser'; 
import { eslint } from 'rollup-plugin-eslint';
import json from '@rollup/plugin-json';

export default [
  {
    output: {
      name: '',
      format: 'cjs',
      sourcemap: true,
      banner: '#! /usr/bin/env node',
    },
    plugins: [
      resolve(), 
      json(),
      eslint({
        throwOnError: true,
        throwOnWarning: true,
        include: ['main.js'],
        exclude: ['node_modules/**'],
      }),
      babel({ babelHelpers: 'bundled' }),
      terser()
    ],
  },
];
