#!/usr/bin/env bash
# Assemble submission/demo.mp4: title cards + recorded app run.
# Requires: ffmpeg, ImageMagick convert, DejaVu fonts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$ROOT/submission/.video-work"
REC="${1:-/home/ubuntu/screencasts/rec-c02dfe78-ceb7-4449-817d-bae3fe217303/rec-c02dfe78-ceb7-4449-817d-bae3fe217303-edited.mp4}"
OUT="$ROOT/submission/demo.mp4"
W=1600; H=1200
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
FONTB=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

mkdir -p "$WORK"

card() { # name duration title body
  local name="$1" title="$2" body="$3"
  convert -size "${W}x${H}" xc:'#0d1117' \
    -fill '#58a6ff' -font "$FONT" -pointsize 30 -gravity north -annotate +0+150 "IBM BOB 2.0 HACKATHON  ·  WATERLOO WORKFLOW LAB" \
    -fill '#e6edf3' -font "$FONTB" -pointsize 72 -gravity center -annotate +0-120 "$title" \
    -fill '#8b949e' -font "$FONT" -pointsize 36 -gravity center -annotate +0+80 "$body" \
    "$WORK/$name.png"
}

card c1 "PreFlight" "Pre-merge diff risk scanner.\nDrop a git diff in. Get an A–F risk report out.\n100% in your browser."
card c2 "The problem" "Every dev has merged a diff they only skimmed.\nPasted keys · debug leftovers · conflict markers ·\nno-rollback migrations · undeclared env vars.\nCheap to catch. Expensive when missed.\nNothing lives in the last 30 seconds before push."
card c3 "12 local checks" "Secrets · entropy assignments · conflict markers ·\ndebug output · TODO/FIXME · sensitive paths ·\ndependency manifests · lockfile drift ·\nirreversible migrations · undeclared env vars ·\nmissing tests · diff size"
card c4 "Local-first by design" "Diffs routinely contain secrets —\ncatching them is half the product.\nSo they never leave your browser.\nNo install. No auth. Paste and go."
card c5 "github.com/sharonbasovich/preflight" "MIT licensed · vanilla TypeScript · 33 passing tests\nBuilt with AI dev partners — Devin overnight, IBM Bob 2.0 after\nbob_sessions/ has the exports. docs/BOB_USAGE.md has the ledger."

# seg: PNG -> mp4 segment with matching codec/dims
seg() { ffmpeg -y -v error -loop 1 -t "$2" -i "$WORK/$1.png" -vf "scale=${W}:${H},format=yuv420p" -c:v libx264 -r 24 -pix_fmt yuv420p "$WORK/$1.mp4"; }

seg c1 6; seg c2 9; seg c3 8; seg c4 8; seg c5 8

# normalize recording to same dims/fps/codec; slow to 0.8x so the app gets ~60s of screen time
ffmpeg -y -v error -i "$REC" -vf "setpts=1.25*PTS,scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:v libx264 -r 24 -pix_fmt yuv420p "$WORK/demo-run.mp4"

cat > "$WORK/list.txt" <<EOF
file 'c1.mp4'
file 'c2.mp4'
file 'demo-run.mp4'
file 'c3.mp4'
file 'c4.mp4'
file 'c5.mp4'
EOF

ffmpeg -y -v error -f concat -safe 0 -i "$WORK/list.txt" -c copy "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
echo "wrote $OUT"
