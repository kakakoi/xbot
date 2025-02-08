export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  temperature: number;
  baseURL?: string;
}

export interface TweetGenerationPrompt {
  topic: string;
  mood: string;
  length?: number;
  hashtags?: string[];
  context?: string; // 追加のコンテキスト情報
}

export interface OpenRouterKeyData {
  label: string;
  usage: number;
  limit: number | null;
  is_free_tier: boolean;
  rate_limit: {
    requests: number;
    interval: string;
  };
}

export interface OpenRouterCompletion {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GenerationResponse {
  data: {
    id: string;
    model: string;
    provider_name: string;
    total_cost: number;
    generation_time?: number;
    tokens_prompt?: number;
    tokens_completion?: number;
    cache_discount?: number;
    finish_reason?: string;
    native_finish_reason?: string;
  };
}
