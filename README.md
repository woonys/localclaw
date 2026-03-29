<div align="center">

# 🦀 LocalClaw

### Setup Local, Use Anywhere.

**Your local Claude Code, accessible from Slack.**<br>
No API key. No infrastructure. No terminal. Just chat.

<p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/woonys/localclaw/stargazers"><img src="https://img.shields.io/github/stars/woonys/localclaw?style=for-the-badge" alt="Stars"></a>
</p>

<p>
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-how-it-works">How It Works</a> ·
  <a href="#-configuration">Configuration</a> ·
  <a href="https://maily.so/devpill">Newsletter</a>
</p>

</div>

---

> **LocalClaw** uses your locally installed `claude` CLI directly — the same auth, same MCP servers, same CLAUDE.md context. It just makes it accessible from Slack instead of a terminal.

```
You (Slack):  @LocalClaw 프로젝트 상태 알려줘
LocalClaw:    *reads your codebase, runs commands, responds in Slack*
```

## Why LocalClaw?

You already use `claude` in your terminal. LocalClaw lets you use it from Slack too — without setting up infrastructure, containers, or API keys.

| | OpenClaw / NanoClaw | **LocalClaw** |
|---|---|---|
| **Setup** | Complex (Gateway, containers, config) | **5 minutes** (clone → .env → run) |
| **Auth** | API key required | **No API key** (uses your CLI login) |
| **Runtime** | Self-contained AI platform | **Your local `claude` CLI** as-is |
| **Scope** | Full-stack AI assistant | **Slack ↔ Claude Code bridge** |

## Features

- **No API key needed** — uses your existing Claude Code subscription (Pro/Max)
- **No terminal needed** — talk to Claude from Slack, get full responses back
- **Thread = conversation** — same thread continues the same session via `--resume`
- **CLAUDE.md aware** — your project context is automatically loaded
- **All 89+ tools** — Bash, Read, Write, GitHub MCP, WebSearch, and more
- **Auto-restart** — crashes recover in 5 seconds
- **5-minute setup** — clone, configure, run

<details>
<summary><b>Where it fits in the Claw ecosystem</b></summary>

| Project | Stars | What it does |
|---------|-------|-------------|
| [OpenClaw](https://github.com/openclaw/openclaw) | 340K | Full-stack AI assistant. 30+ channels, apps, Gateway architecture |
| [NanoClaw](https://github.com/qwibitai/nanoclaw) | 26K | Lightweight OpenClaw alternative with container isolation |
| [PicoClaw](https://github.com/sipeed/picoclaw) | 27K | Ultra-lightweight. Runs on $10 devices with <10MB RAM |
| **LocalClaw** | - | **Your local Claude Code, accessible from Slack. That's it.** |

LocalClaw is not a general-purpose AI assistant. It's for people who already use `claude` in their terminal and want to use it from Slack too — without setting up infrastructure, containers, or API keys.

</details>

## 🚀 Quick Start

### Step 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**
2. **OAuth & Permissions** → Add Bot Token Scopes:
   ```
   app_mentions:read, channels:history, channels:read, chat:write,
   files:read, groups:history, groups:read, im:history, im:read,
   im:write, mpim:history, mpim:read, users:read
   ```
3. **Socket Mode** → Enable
4. **Basic Information** → App-Level Tokens → Generate with `connections:write` scope
5. **Event Subscriptions** → Subscribe to: `app_mention`, `message.im`
6. **Install to Workspace**

### Step 2. Configure

```bash
git clone https://github.com/woonys/localclaw.git
cd localclaw
cp .env.example .env
```

Edit `.env`:
```bash
SLACK_BOT_TOKEN=xoxb-...              # OAuth & Permissions → Bot Token
SLACK_APP_TOKEN=xapp-...              # Basic Info → App-Level Token
SLACK_SIGNING_SECRET=...              # Basic Info → Signing Secret
CLAUDE_SYSTEM_BINARY=$(which claude)  # Your claude CLI path
BASE_DIRECTORY=/path/to/your/project  # Default working directory
```

### Step 3. Run

```bash
npm install   # installs deps + auto-patches SDK
npm start     # start the bot
```

For background with auto-restart:
```bash
tmux new-session -d -s localclaw "./start.sh"

# View logs
tmux attach -t localclaw    # Ctrl+B then D to detach
```

### Step 4. Use

```
@LocalClaw what files are in this project?
@LocalClaw run the tests and tell me what failed
@LocalClaw explain this codebase architecture
@LocalClaw cwd /path/to/another/project
```

## 🔧 How It Works

```
Slack message
  → Socket Mode (WebSocket)
  → LocalClaw (Node.js)
  → spawns: claude --print "your message" --cwd /your/project
  → claude CLI reads CLAUDE.md, uses tools, generates response
  → streams back to Slack
```

- Uses your **system `claude` binary** directly — same auth, same MCP servers, same everything
- Each Slack **thread** is an independent session (`--resume` for continuity)
- `CLAUDE.md` in your project directory is automatically loaded as context
- All 89+ Claude Code tools available (Bash, Read, Write, GitHub MCP, etc.)

## ⚙️ Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Slack bot OAuth token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Yes | Slack app-level token (`xapp-...`) |
| `SLACK_SIGNING_SECRET` | Yes | Slack signing secret |
| `CLAUDE_SYSTEM_BINARY` | Recommended | Path to `claude` CLI (run `which claude`) |
| `BASE_DIRECTORY` | Recommended | Default working directory for all channels |
| `ANTHROPIC_API_KEY` | No | Only if not using CLI auth |
| `CLAUDE_MAX_TURNS` | No | Max tool-use turns per query (default: 10) |
| `DEBUG` | No | Enable debug logging |

## 🩹 SDK Patch

The `@anthropic-ai/claude-code` SDK bundles its own `cli.js` which may not match your installed Claude Code version. The `postinstall` script automatically patches it to:

1. Use your **system `claude` binary** via `CLAUDE_SYSTEM_BINARY`
2. Handle **exit codes gracefully** after successful results

No manual steps needed — runs on `npm install`.

## 🗺️ Roadmap

- [x] Slack integration
- [x] Thread-based session persistence
- [x] System claude binary support
- [x] Auto-restart on crash
- [ ] Telegram channel support
- [ ] Discord channel support
- [ ] Multi-project cwd switching via slash commands
- [ ] Web UI dashboard

## 🤝 Credits

Based on [mpociot/claude-code-slack-bot](https://github.com/mpociot/claude-code-slack-bot). Enhanced with system binary support, auto-restart, and SDK compatibility patches.

Built by [Jaewoon Kim](https://github.com/woonys) · [DevPill Newsletter](https://maily.so/devpill)

## 📄 License

MIT
