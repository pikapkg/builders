import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import babel from '@babel/core';
import babelPluginDynamicImportSyntax from '@babel/plugin-syntax-dynamic-import';
import babelPluginImportMetaSyntax from '@babel/plugin-syntax-import-meta';
import babelPresetTypeScript from '@babel/preset-typescript';
import babelPluginImportRewrite from '@pika/babel-plugin-esm-import-rewrite';
import {BuilderOptions} from '@pika/types';

export function manifest(newManifest) {
  newManifest.source = newManifest.source || 'dist-src/index.js';
  return newManifest;
}

export async function build({cwd, out, src}: BuilderOptions): Promise<void> {
  for (const fileAbs of src.files) {
    const writeToSrc = fileAbs
      .replace(path.join(cwd, 'src/'), path.join(out, '/dist-src/'))
      .replace('.ts', '.js')
      .replace('.tsx', '.js')
      .replace('.jsx', '.js')
      .replace('.mjs', '.js');
    const resultSrc = await babel.transformFileAsync(fileAbs, {
      cwd,
      presets: [[babelPresetTypeScript]],
      plugins: [
        [babelPluginImportRewrite, {addExtensions: true}],
        babelPluginDynamicImportSyntax,
        babelPluginImportMetaSyntax,
      ],
    });
    mkdirp.sync(path.dirname(writeToSrc));
    fs.writeFileSync(writeToSrc, resultSrc.code);
  }
}