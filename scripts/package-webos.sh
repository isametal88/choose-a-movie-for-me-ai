#!/usr/bin/env bash
set -euo pipefail

SRC="dist/webos/browser"
OUT="dist/webos"
INDEX="${SRC}/index.html"
ESBUILD="node_modules/esbuild/bin/esbuild"

echo "→ Bundling as IIFE for Chrome 68 (no ES modules)…"
# Create a single entry that imports polyfills then main
node - <<'JS'
const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  stdin: {
    contents: "import './polyfills.js'; import './main.js';",
    resolveDir: path.resolve('dist/webos/browser'),
    sourcefile: 'bundle-entry.js',
  },
  bundle: true,
  platform: 'browser',
  target: ['chrome68'],
  format: 'iife',
  outfile: 'dist/webos/browser/app-bundle.js',
  logLevel: 'info',
}).catch(() => process.exit(1));
JS

echo "→ Patching index.html…"
# Remove modulepreload links
sed -i '' 's|<link rel="modulepreload[^"]*" [^>]*>||g' "${INDEX}"
# Remove polyfills.js and main.js module scripts
sed -i '' 's|<script src="polyfills\.js" type="module"></script>||g' "${INDEX}"
sed -i '' 's|<script src="main\.js" type="module"></script>||g' "${INDEX}"
# Remove es-module-shims if present
sed -i '' 's|<script>window\.esmsInitOptions[^<]*</script>||g' "${INDEX}"
sed -i '' 's|<script src="es-module-shims\.js"></script>||g' "${INDEX}"
# Inject the IIFE bundle before </body>
sed -i '' 's|</body>|<script src="app-bundle.js"></script></body>|' "${INDEX}"

echo "→ Packaging webOS app…"
ares-package --no-minify "${SRC}" --outdir "${OUT}"
echo "✓ Done — $(ls "${OUT}"/*.ipk)"
