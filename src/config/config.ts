import 'dotenv/config';
import { TwitterConfig } from '../types/config';

// 環境変数の存在確認
const requiredEnvVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET_KEY',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
] as const;

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} is not set in environment variables`);
    }
}

export const config: TwitterConfig = {
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecretKey: process.env.TWITTER_API_SECRET_KEY!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
};
