import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { BotConfig } from './types';

dotenv.config();

export const config = {
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN!,
    appToken: process.env.SLACK_APP_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },
  claude: {
    useBedrock: process.env.CLAUDE_CODE_USE_BEDROCK === '1',
    useVertex: process.env.CLAUDE_CODE_USE_VERTEX === '1',
  },
  baseDirectory: process.env.BASE_DIRECTORY || '',
  debug: process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development',
};

export function validateConfig() {
  // In multi-bot mode, bots.json handles validation
  if (loadBotsConfig()) return;

  const required = [
    'SLACK_BOT_TOKEN',
    'SLACK_APP_TOKEN',
    'SLACK_SIGNING_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function resolveEnvVar(value: string): string {
  if (value.startsWith('$')) {
    const envKey = value.slice(1);
    return process.env[envKey] || '';
  }
  return value;
}

export function loadBotsConfig(): BotConfig[] | null {
  const botsPath = path.join(process.cwd(), 'bots.json');
  if (!fs.existsSync(botsPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(botsPath, 'utf8'));
    const bots: BotConfig[] = raw.bots.map((bot: any) => {
      const resolved: BotConfig = {
        name: bot.name,
        slackBotToken: resolveEnvVar(bot.slackBotToken),
        slackAppToken: resolveEnvVar(bot.slackAppToken),
        slackSigningSecret: resolveEnvVar(bot.slackSigningSecret),
        cwd: bot.cwd,
        systemPrompt: bot.systemPrompt,
        agentFile: bot.agentFile,
      };

      // If agentFile specified, read it as systemPrompt
      if (bot.agentFile && !bot.systemPrompt) {
        const agentPath = bot.cwd
          ? path.join(bot.cwd, bot.agentFile)
          : path.resolve(bot.agentFile);
        if (fs.existsSync(agentPath)) {
          resolved.systemPrompt = fs.readFileSync(agentPath, 'utf8');
        }
      }

      return resolved;
    });

    // Validate each bot has required tokens
    for (const bot of bots) {
      if (!bot.slackBotToken || !bot.slackAppToken || !bot.slackSigningSecret) {
        throw new Error(`Bot "${bot.name}" is missing required Slack tokens. Check bots.json and .env`);
      }
    }

    return bots;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid bots.json: ${error.message}`);
    }
    throw error;
  }
}
