#!/bin/bash
# Gives Codex EVY's tools and its start-of-session and end-of-turn hooks, in ~/.codex/config.toml between EVY's
# markers, replacing what an earlier run wrote there and touching nothing else. Codex runs a hook only after the
# person trusts it once in /hooks, and again after every change to it. Untested until CX1 (Codex on a new Mac).
# Usage: codex/setup.sh   (from the installed plugin; reads EVY's address from EVY Desktop's env file)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
. "$ROOT/bin/evy-lib.sh"

base="$(evy_base)" || { echo "EVY is not set up on this Mac: pair it in EVY Desktop first." >&2; exit 1; }
config="${CODEX_HOME:-$HOME/.codex}/config.toml"
mkdir -p "$(dirname "$config")"
touch "$config"
outside="$(awk -v s="# >>> EVY" -v e="# <<< EVY" 'index($0,s)==1{skip=1} !skip{print} index($0,e)==1{skip=0}' "$config")"
if printf '%s\n' "$outside" | grep -q '^\[mcp_servers\.evy\]'; then
  echo "$config already has an [mcp_servers.evy] of its own: remove it (codex mcp remove evy), then run this again." >&2
  exit 1
fi

start="# >>> EVY (written by EVY's setup; edits here are replaced)"
end="# <<< EVY"
block="$start
[mcp_servers.evy]
url = \"$base/mcp\"
http_headers_helper = \"$ROOT/codex/evy-headers\"

[[hooks.SessionStart]]
matcher = \"startup|clear|compact\"
[[hooks.SessionStart.hooks]]
type = \"command\"
command = \"$ROOT/codex/evy-session-start\"
timeout = 15

[[hooks.Stop]]
[[hooks.Stop.hooks]]
type = \"command\"
command = \"$ROOT/codex/evy-stop\"
timeout = 10
$end"

kept="$(awk -v s="$start" -v e="$end" '$0==s{skip=1} !skip{print} $0==e{skip=0}' "$config")"
printf '%s\n\n%s\n' "${kept%$'\n'}" "$block" > "$config.evy-tmp"
mv "$config.evy-tmp" "$config"
echo "EVY added to $config. Open Codex and trust EVY's hooks in /hooks."
