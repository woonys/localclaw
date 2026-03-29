#!/bin/bash
# Auto-restart wrapper for Claude Code Slack Bot
# Usage: ./start.sh
# Or with tmux: tmux new-session -d -s claude-slack "./start.sh"

cd "$(dirname "$0")"

while true; do
  echo "[$(date)] Starting Claude Code Slack bot..."
  npx tsx src/index.ts 2>&1 | tee -a bot.log
  EXIT_CODE=$?
  echo "[$(date)] Bot exited with code $EXIT_CODE. Restarting in 5s..."
  sleep 5
done
