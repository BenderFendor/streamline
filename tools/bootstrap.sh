#!/usr/bin/env bash
# bootstrap.sh -- one command to go from clean clone to working environment.
# Streamline: Next.js 15 + TypeScript + Tailwind CSS.
set -euo pipefail

echo "== bootstrap =="

echo "--- install ---"
npm install

echo
echo "--- verify build ---"
npm run build

echo
echo "== bootstrap complete =="
echo
echo "Required environment variables:"
echo "  NEXT_PUBLIC_TMDB_API_KEY  -- TMDB API key (v3 auth or access token)"
echo
echo "Optional:"
echo "  GITHUB_ID     -- GitHub OAuth app client ID"
echo "  GITHUB_SECRET -- GitHub OAuth app client secret"
echo
echo "Run: npm run dev"
