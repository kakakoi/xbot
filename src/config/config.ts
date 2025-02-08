import type { TwitterConfig } from '../types/config';
import type { OpenRouterConfig } from '../types/openrouter';
import {
  getNumericEnv,
  getOptionalEnv,
  getRequiredEnv,
  validateEnv,
} from '../utils/env';

// 必要な環境変数を事前チェック
validateEnv([
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET_KEY',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'OPENROUTER_API_KEY',
]);

export const openrouterConfig: OpenRouterConfig = {
  apiKey: getRequiredEnv('OPENROUTER_API_KEY'),
  model: getOptionalEnv('OPENROUTER_MODEL', 'gryphe/mythomax-l2-13b'),
  temperature: getNumericEnv('OPENROUTER_TEMPERATURE', 0.7),
};

export const config: TwitterConfig = {
  apiKey: getRequiredEnv('TWITTER_API_KEY'),
  apiSecretKey: getRequiredEnv('TWITTER_API_SECRET_KEY'),
  accessToken: getRequiredEnv('TWITTER_ACCESS_TOKEN'),
  accessTokenSecret: getRequiredEnv('TWITTER_ACCESS_TOKEN_SECRET'),
};
