#!/usr/bin/env bash
# Generates assets/gifs/list.json from files in assets/gifs/random/
# Usage: bash scripts/update-gifs.sh
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GIF_DIR="$SCRIPT_DIR/assets/gifs/random"
OUTPUT="$SCRIPT_DIR/assets/gifs/list.json"
if [ ! -d "$GIF_DIR" ]; then
  echo "ERROR: $GIF_DIR not found" >&2
  exit 1
fi
FILES=("$GIF_DIR"/*)
JSON="["
FIRST=true
for f in "${FILES[@]}"; do
  BASE=$(basename "$f")
  if [ -f "$f" ]; then
    if [ "$FIRST" = true ]; then
      FIRST=false
    else
      JSON+=", "
    fi
    JSON+="\"$BASE\""
  fi
done
JSON+="]"
echo "$JSON" > "$OUTPUT"
echo "Generated $OUTPUT ($(ls -1 "$GIF_DIR" | wc -l) GIFs)"
