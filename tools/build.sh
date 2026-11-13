#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
toolsdir=$(mktemp -d)
trap 'rm -rf "$toolsdir"' EXIT
archive=${ESTELLA_ARCHIVE:-$toolsdir/estella.zip}
if [[ ! -f "$archive" ]]; then
 curl -fLsS --retry 2 https://github.com/esengine/estella/releases/download/v0.103.0/Estella-Editor-0.103.0-arm64-mac.zip -o "$archive"
fi
echo "f9ae91e11b6a941724c5f26b3854927baa91bc1466569b7d3414c6b81f4947c9  $archive" | sha256sum -c -
base=estella-editor.app/Contents/Resources/app.asar.unpacked
unzip -q "$archive" "$base/node_modules/esengine/*" -d "$toolsdir"
mkdir -p "$root/dist/runtime"
for file in esengine.js esengine.wasm; do unzip -p "$archive" "$base/dist/wasm/$file" > "$root/dist/runtime/$file"; done
cp "$root/index.html" "$root/dist/"
cp "$root/ESTELLA-LICENSE" "$root/dist/"
npm install --prefix "$toolsdir" --no-audit --no-fund esbuild@0.27.0
"$toolsdir/node_modules/.bin/esbuild" "$root/src/main.js" --bundle --format=esm --target=es2022 --minify --alias:esengine="$toolsdir/$base/node_modules/esengine/dist/index.js" --external:./runtime/esengine.js --outfile="$root/dist/app.js"
