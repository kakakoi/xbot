import 'dotenv/config';
import { TwitterConfig } from '../types/config';
import { OpenRouterConfig } from '../types/openrouter';

// Twitter設定の確認
const requiredEnvVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET_KEY',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'OPENROUTER_API_KEY'
] as const;

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} is not set in environment variables`);
    }
}

export const openrouterConfig: OpenRouterConfig = {
    apiKey: process.env.OPENROUTER_API_KEY!,
    model: process.env.OPENROUTER_MODEL || 'gryphe/mythomax-l2-13b',
    temperature: Number(process.env.OPENROUTER_TEMPERATURE) || 0.7
};

export const config: TwitterConfig = {
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecretKey: process.env.TWITTER_API_SECRET_KEY!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
};
