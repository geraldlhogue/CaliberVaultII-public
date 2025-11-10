set -euo pipefail
f="${1:-}"
if [ -z "$f" ]; then echo "usage: $0 <vitest.out.txt>"; exit 1; fi
awk 'BEGIN{cmd="date +%H:%M:%S"} /^[[:space:]]|^PASS|^FAIL|^ RUN/{ cmd | getline t; close("date +%H:%M:%S"); gsub(/\r/,""); print t " " $0 }' "$f"
