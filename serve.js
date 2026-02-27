#!/usr/bin/env bun

import { join } from 'path';

const DIST = join(import.meta.dir, 'dist');
const PORT = 8080;

Bun.serve({
  port: PORT,
  async fetch(req) {
    let path = new URL(req.url).pathname;

    // Clean URLs: /test/ → /test/index.html
    if (path.endsWith('/')) path += 'index.html';
    if (!path.includes('.')) path += '/index.html';

    const file = Bun.file(join(DIST, path));
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response('Not found', { status: 404 });
  }
});

console.log(`http://localhost:${PORT}`);
