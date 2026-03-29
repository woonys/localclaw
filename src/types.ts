export interface ConversationSession {
  userId: string;
  channelId: string;
  threadTs?: string;
  sessionId?: string;
  isActive: boolean;
  lastActivity: Date;
  workingDirectory?: string;
}

export interface WorkingDirectoryConfig {
  channelId: string;
  threadTs?: string;
  userId?: string;
  directory: string;
  setAt: Date;
}

export interface BotConfig {
  name: string;
  slackBotToken: string;
  slackAppToken: string;
  slackSigningSecret: string;
  cwd?: string;
  systemPrompt?: string;
  agentFile?: string;
}