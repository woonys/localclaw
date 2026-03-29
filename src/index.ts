import { App } from '@slack/bolt';
import { config, validateConfig, loadBotsConfig } from './config';
import { ClaudeHandler } from './claude-handler';
import { SlackHandler } from './slack-handler';
import { McpManager } from './mcp-manager';
import { Logger } from './logger';

const logger = new Logger('Main');

async function start() {
  try {
    validateConfig();

    const mcpManager = new McpManager();
    mcpManager.loadConfiguration();
    const claudeHandler = new ClaudeHandler(mcpManager);

    const botsConfig = loadBotsConfig();

    if (botsConfig) {
      // Multi-bot mode
      logger.info(`Starting LocalClaw in multi-bot mode (${botsConfig.length} bots)`);

      for (const botConfig of botsConfig) {
        const app = new App({
          token: botConfig.slackBotToken,
          signingSecret: botConfig.slackSigningSecret,
          socketMode: true,
          appToken: botConfig.slackAppToken,
        });

        const handler = new SlackHandler(app, claudeHandler, mcpManager, {
          name: botConfig.name,
          systemPrompt: botConfig.systemPrompt,
          cwd: botConfig.cwd,
        });

        handler.setupEventHandlers();
        await app.start();
        logger.info(`🤖 Bot "${botConfig.name}" is running!`, {
          cwd: botConfig.cwd || config.baseDirectory || 'not set',
          hasSystemPrompt: !!botConfig.systemPrompt,
        });
      }

      logger.info(`⚡️ LocalClaw is running with ${botsConfig.length} bots!`);
    } else {
      // Single-bot mode (backward compatible)
      logger.info('Starting LocalClaw in single-bot mode');

      const app = new App({
        token: config.slack.botToken,
        signingSecret: config.slack.signingSecret,
        socketMode: true,
        appToken: config.slack.appToken,
      });

      const slackHandler = new SlackHandler(app, claudeHandler, mcpManager);
      slackHandler.setupEventHandlers();
      await app.start();

      logger.info('⚡️ LocalClaw is running!', {
        debugMode: config.debug,
        baseDirectory: config.baseDirectory || 'not set',
      });
    }
  } catch (error) {
    logger.error('Failed to start LocalClaw', error);
    process.exit(1);
  }
}

start();
