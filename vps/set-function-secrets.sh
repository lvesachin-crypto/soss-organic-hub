#!/usr/bin/env bash
# =============================================================
# Give the self-hosted edge-functions container the app secrets
# (PROVIDER_KEY_SECRET, TELEGRAM_*, CRON_SECRET, LOVABLE_API_KEY ...)
#
# Usage (on VPS):
#   bash vps/set-function-secrets.sh PROVIDER_KEY_SECRET=<value> [KEY=VALUE ...]
# Values are stored in /opt/supabase/functions.env (chmod 600)
# =============================================================
set -euo pipefail

STACK_DIR="${STACK_DIR:-/opt/supabase}"
ENV_FILE="$STACK_DIR/functions.env"
OVERRIDE="$STACK_DIR/docker-compose.override.yml"

mkdir -p "$STACK_DIR"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

if [ "$#" -eq 0 ]; then
  echo "No KEY=VALUE pairs given. Current keys in $ENV_FILE:"
  cut -d= -f1 "$ENV_FILE"
  exit 1
fi

for pair in "$@"; do
  key="${pair%%=*}"
  val="${pair#*=}"
  if grep -q "^${key}=" "$ENV_FILE"; then
    # rewrite without sed delimiters issues
    grep -v "^${key}=" "$ENV_FILE" > "$ENV_FILE.tmp" || true
    mv "$ENV_FILE.tmp" "$ENV_FILE"
  fi
  printf '%s=%s\n' "$key" "$val" >> "$ENV_FILE"
  echo "   set $key"
done
chmod 600 "$ENV_FILE"

cat > "$OVERRIDE" <<YML
services:
  functions:
    env_file:
      - ./functions.env
YML

echo "==> restarting edge functions"
cd "$STACK_DIR"
docker compose up -d functions
sleep 3
docker compose ps --format '{{.Name}}  {{.Status}}' | grep functions || true
echo "==> done"
