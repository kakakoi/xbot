import type { TwitterConfig } from "../types/config";
import type { OpenRouterConfig } from "../types/openrouter";
import {
  getNumericEnv,
  getOptionalEnv,
  getRequiredEnv,
  validateEnv,
} from "../utils/env";

// 必要な環境変数を事前チェック
validateEnv([
  "TWITTER_API_KEY",
  "TWITTER_API_SECRET_KEY",
  "TWITTER_ACCESS_TOKEN",
  "TWITTER_ACCESS_TOKEN_SECRET",
  "OPENROUTER_API_KEY",
]);

interface Config {
  twitter: TwitterConfig;
  openrouter: OpenRouterConfig;
}

export const config: Config = {
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || "",
    apiSecretKey: process.env.TWITTER_API_SECRET_KEY || "",
    accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    temperature: Number(process.env.OPENROUTER_TEMPERATURE) || 0.7,
  },
};

// openrouterConfigを別途エクスポート
export const openrouterConfig: OpenRouterConfig = config.openrouter;
