# Shared by EVY's hooks and header helper: where EVY is and this agent's token, read from the env file EVY Desktop
# writes when it pairs this Mac (EVY_URL and COMPASS_AGENT_TOKENS, "name:token,..."). Plain bash 3.2 and the tools
# every Mac has; no git, which on a Mac without Apple's developer tools would offer to install them.

EVY_ENV_FILE="${EVY_RUNNER_ENV:-$HOME/Library/Application Support/EVY/Runner/.env}"

# The value of KEY in the env file, without surrounding quotes.
evy_env_value() {
  [ -r "$EVY_ENV_FILE" ] || return 1
  local line value
  line="$(grep -E "^[[:space:]]*$1[[:space:]]*=" "$EVY_ENV_FILE" | tail -n 1)" || return 1
  value="${line#*=}"
  value="$(printf '%s' "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^["'\'']//' -e 's/["'\'']$//')"
  [ -n "$value" ] && printf '%s' "$value"
}

# EVY's address without a path, from EVY_URL (".../runner").
evy_base() {
  local url
  url="$(evy_env_value EVY_URL || evy_env_value COMPASS_URL)" || return 1
  url="${url%/}"
  printf '%s' "${url%/runner}"
}

# The token of this Mac's agent of kind $1 (claude-code, codex): the one paired with that kind, else the one named
# like it, else the only one.
evy_token() {
  local kind="$1" tokens kinds name pair
  tokens="$(evy_env_value COMPASS_AGENT_TOKENS)" || tokens=""
  kinds="$(evy_env_value COMPASS_AGENT_KINDS)" || kinds=""
  name=""
  for pair in $(printf '%s' "$kinds" | tr ',' ' '); do
    [ "${pair#*:}" = "$kind" ] && { name="${pair%%:*}"; break; }
  done
  [ -z "$name" ] && case "$kind" in claude-code) name=claude ;; *) name="$kind" ;; esac
  for pair in $(printf '%s' "$tokens" | tr ',' ' '); do
    [ "${pair%%:*}" = "$name" ] && { printf '%s' "${pair#*:}"; return 0; }
  done
  case "$tokens" in
    *,*) ;;
    *:*) printf '%s' "${tokens#*:}"; return 0 ;;
  esac
  [ "$kind" = "claude-code" ] && evy_env_value COMPASS_CLAUDE_TOKEN
}

# The repository's main folder when $1 is a git worktree (its .git is a file naming .../.git/worktrees/<name>).
evy_repo_folder() {
  local dir="$1" gitdir
  while [ -n "$dir" ] && [ "$dir" != "/" ]; do
    if [ -f "$dir/.git" ]; then
      gitdir="$(sed -n 's/^gitdir:[[:space:]]*//p' "$dir/.git" | head -n 1)"
      case "$gitdir" in */.git/worktrees/*) printf '%s' "${gitdir%/.git/worktrees/*}" ;; esac
      return 0
    fi
    [ -d "$dir/.git" ] && return 0
    dir="$(dirname "$dir")"
  done
}

# Whether $1 sits in a git repository.
evy_in_git() {
  local dir="$1"
  while [ -n "$dir" ] && [ "$dir" != "/" ]; do
    [ -e "$dir/.git" ] && return 0
    dir="$(dirname "$dir")"
  done
  return 1
}

# $1 as a JSON string.
evy_json() {
  printf '"%s"' "$(printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr -d '\000-\037')"
}

# A string field of the hook's JSON input on stdin, saved in EVY_INPUT ("session_id", "cwd", ...).
evy_field() {
  printf '%s' "$EVY_INPUT" | tr -d '\n' | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -n 1
}

# Where the hooks of one session keep what they need between turns.
evy_session_dir() {
  local id
  id="$(printf '%s' "$1" | tr -cd 'A-Za-z0-9_-')"
  [ -n "$id" ] && printf '%s' "${TMPDIR:-/tmp}/evy-sessions/$id"
}

# The agent kind these scripts serve: Codex's wrappers in codex/ set EVY_AGENT_KIND=codex.
EVY_KIND="${EVY_AGENT_KIND:-claude-code}"
