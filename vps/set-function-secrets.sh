#!/usr/bin/env bash
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
  exit 0
fi

for pair in "$@"; do
  key="${pair%%=*}"
  val="${pair#*=}"
  grep -v "^${key}=" "$ENV_FILE" > "$ENV_FILE.tmp" || true
  printf '%s=%s\n' "$key" "$val" >> "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
  echo "   set $key"
done
chmod 600 "$ENV_FILE"

# Detect actual service name (default to functions)
cd "$STACK_DIR"
SERVICE_NAME=$(docker compose ps --format '{{.Service}}' | grep -E '^(functions|edge-functions)$' | head -n 1 || echo "functions")

# Generate environment block for YAML
ENV_BLOCK=""
while IFS='=' read -r key val || [ -n "$key" ]; do
  [ -z "$key" ] && continue
  # Escape quotes for YAML
  val_escaped=$(echo "$val" | sed 's/"/\\"/g')
  ENV_BLOCK="$ENV_BLOCK
      $key: \"$val_escaped\""
done < "$ENV_FILE"

cat > "$OVERRIDE" <<YML
services:
  $SERVICE_NAME:
    environment: $ENV_BLOCK
YML

echo "==> updating $SERVICE_NAME service"
docker compose up -d "$SERVICE_NAME"
echo "==> done"
