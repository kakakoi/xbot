import 'dotenv/config';
import type { TwitterConfig } from '../types/config';
import type { OpenRouterConfig } from '../types/openrouter';

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}

export const openrouterConfig: OpenRouterConfig = {
  apiKey: getRequiredEnvVar('OPENROUTER_API_KEY'),
  model:
    process.env.OPENROUTER_MODEL ||
    'google/gemini-2.0-flash-lite-preview-02-05:free',
  temperature: Number(process.env.OPENROUTER_TEMPERATURE) || 0.7,
};

export const config: TwitterConfig = {
  apiKey: getRequiredEnvVar('TWITTER_API_KEY'),
  apiSecretKey: getRequiredEnvVar('TWITTER_API_SECRET_KEY'),
  accessToken: getRequiredEnvVar('TWITTER_ACCESS_TOKEN'),
  accessTokenSecret: getRequiredEnvVar('TWITTER_ACCESS_TOKEN_SECRET'),
};
