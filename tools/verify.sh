#!/usr/bin/env bash
# verify.sh -- single command to gate any patch.
# Streamline: Next.js 15 TypeScript project.
set -euo pipefail

echo "== verify =="

echo "--- install ---"
npm ci --silent 2>/dev/null || npm install --silent
echo

echo "--- lint ---"
npm run lint
echo

echo "--- typecheck ---"
npx tsc --noEmit
echo

echo "--- build ---"
npm run build
echo

echo "--- audit (npm) ---"
npm audit --audit-level=high 2>&1 || echo "  npm audit found high+ severity issues"
echo

echo "== verify passed =="
