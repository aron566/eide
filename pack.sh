#!/usr/bin/env bash
# ============================================================
#  EIDE local VSIX packager
#
#  Usage:
#    ./pack.sh                 -> builds eide-v<version>-local.vsix
#    ./pack.sh myname.vsix     -> builds myname.vsix
#
#  NOTE: do NOT pass --no-dependencies to vsce. The webpack
#  bundle marks x2js/jsonc/iconv-lite as externals, they are
#  loaded from node_modules at runtime, so the VSIX must ship
#  node_modules or the extension fails to activate
#  ("command '_cl.eide.project.refresh' not found").
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] node not found in PATH"
    exit 1
fi

VERSION=$(node -p "require('./package.json').version")
if [ -z "$VERSION" ]; then
    echo "[ERROR] cannot read version from package.json"
    exit 1
fi

OUT="${1:-eide-v${VERSION}-local.vsix}"

if [ ! -d node_modules ]; then
    echo "[INFO] node_modules missing, installing dependencies ..."
    npm install
fi

echo "[INFO] building production bundle (webpack) ..."
npm run vscode:prepublish

echo "[INFO] packaging $OUT (with runtime dependencies) ..."
npx --yes @vscode/vsce package -o "$OUT"

echo "[INFO] done: $(pwd)/$OUT"
