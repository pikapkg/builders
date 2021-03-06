import path from 'path';
import fs from 'fs';
import util from 'util';
import glob from 'glob';
import mkdirp from 'mkdirp';
import {BuilderOptions} from '@pika/types';
const DEFAULT_ENTRYPOINT = 'deno';

export async function manifest(manifest, {cwd, options}: BuilderOptions): Promise<void> {
  const pathToTsconfig = path.join(cwd, 'tsconfig.json');
  if (!fs.existsSync(pathToTsconfig)) {
    return;
  }
  if (options.entrypoint !== null) {
    let keys = options.entrypoint || [DEFAULT_ENTRYPOINT];
    if (typeof keys === 'string') {
      keys = [keys];
    }
    for (const key of keys) {
      manifest[key] = manifest[key] || 'dist-deno/index.ts';
    }
  }
}

export async function build({cwd, out, options}: BuilderOptions): Promise<void> {
  const pathToTsconfig = path.join(cwd, 'tsconfig.json');
  if (!fs.existsSync(pathToTsconfig)) {
    return;
  }

  const files = await util.promisify(glob)(`src/**/*`, {
    cwd,
    nodir: true,
    absolute: true,
    ignore: (options.exclude || []).map(g => path.join('src', g)),
  });
  for (const fileAbs of files) {
    if (path.extname(fileAbs) !== '.ts' && path.extname(fileAbs) !== '.tsx') {
      continue;
    }
    const fileRel = path.relative(cwd, fileAbs);
    const writeToTypeScript = path
      .resolve(out, fileRel)
      .replace(`${path.sep}src${path.sep}`, `${path.sep}dist-deno${path.sep}`);
    mkdirp.sync(path.dirname(writeToTypeScript));
    fs.copyFileSync(fileAbs, writeToTypeScript);
  }
}
