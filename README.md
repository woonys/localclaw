# Claude Code Slack Bot

Run **Claude Code** directly from Slack. Uses your existing `claude` CLI subscription — **no API key needed**.

```
You (Slack): @Claude 이 프로젝트 상태 알려줘
Claude:      *reads your codebase, runs commands, responds*
```

## Why?

- **No API key required** — uses your `claude` CLI login (Pro/Max subscription)
- **Full Claude Code power** — file access, bash, MCP servers, all 89+ tools
- **Thread = conversation** — replies in the same thread continue the session
- **CLAUDE.md aware** — automatically loads your project context
- **Auto-restart** — crashes recover in 5 seconds

## Quick Start (5 minutes)

### 1. Create Slack App

Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**

Add these **Bot Token Scopes** (OAuth & Permissions):
```
app_mentions:read, channels:history, channels:read, chat:write,
files:read, groups:history, groups:read, im:history, im:read,
im:write, mpim:history, mpim:read, users:read
```

Enable **Socket Mode** (Settings → Socket Mode → Enable)

Create an **App-Level Token** with `connections:write` scope

Subscribe to **bot events**: `app_mention`, `message.im`

Install the app to your workspace.

### 2. Configure

```bash
git clone https://github.com/woonys/claude-code-slack.git
cd claude-code-slack
cp .env.example .env
```

Edit `.env`:
```bash
SLACK_BOT_TOKEN=xoxb-...        # OAuth & Permissions → Bot Token
SLACK_APP_TOKEN=xapp-...        # Basic Info → App-Level Token
SLACK_SIGNING_SECRET=...        # Basic Info → Signing Secret
CLAUDE_SYSTEM_BINARY=$(which claude)  # Your claude CLI path
BASE_DIRECTORY=/path/to/projects      # Default working directory
```

### 3. Run

```bash
npm install    # Installs deps + auto-patches SDK
npm start      # Start the bot
```

For background with auto-restart:
```bash
# With tmux
tmux new-session -d -s claude-slack "./start.sh"

# Check logs
tmux attach -t claude-slack    # Ctrl+B then D to detach
tail -f bot.log
```

### 4. Use

In Slack:
```
@YourBot what files are in this project?
@YourBot run the tests
@YourBot explain the architecture of this codebase
```

Set working directory per channel:
```
@YourBot cwd /path/to/project
@YourBot cwd my-project          # relative to BASE_DIRECTORY
```

## How It Works

```
Slack message → Socket Mode → SlackHandler
    → ClaudeHandler → spawn claude CLI (your system binary)
    → claude reads CLAUDE.md, uses tools, generates response
    → stream back to Slack
```

- Each Slack **thread** = independent Claude session
- Sessions persist via `--resume` (conversation continues in-thread)
- Your `claude` CLI's auth, MCP servers, and settings are used as-is
- `CLAUDE.md` in your project directory is automatically loaded as context

## SDK Patch

The `@anthropic-ai/claude-code` SDK bundles its own `cli.js`, which may not match your installed `claude` CLI version. The `postinstall` script patches the SDK to:

1. **Use your system `claude` binary** via `CLAUDE_SYSTEM_BINARY` env var
2. **Handle exit codes gracefully** — ignore exit code 1 after receiving a successful result

This runs automatically on `npm install`.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Slack bot OAuth token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Yes | Slack app-level token (`xapp-...`) |
| `SLACK_SIGNING_SECRET` | Yes | Slack signing secret |
| `CLAUDE_SYSTEM_BINARY` | Recommended | Path to your `claude` CLI binary |
| `BASE_DIRECTORY` | Recommended | Default working directory |
| `ANTHROPIC_API_KEY` | No | Only needed if not using CLI auth |
| `CLAUDE_MAX_TURNS` | No | Max tool-use turns per query (default: 10) |
| `DEBUG` | No | Enable debug logging |

## Credits

Based on [mpociot/claude-code-slack-bot](https://github.com/mpociot/claude-code-slack-bot). Enhanced with system binary support, auto-restart, and SDK compatibility patches.

## License

MIT
