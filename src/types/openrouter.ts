export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  temperature: number;
  baseURL?: string;
}

export interface TweetGenerationPrompt {
  topic?: string;
  mood?: string;
  length?: number;
  hashtags?: string[];
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

export interface OpenRouterKey {
  data: OpenRouterKeyData;
}

export interface OpenRouterMessage {
  role: string;
  content: string;
}

export interface OpenRouterChoice {
  message: OpenRouterMessage;
}

export interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
}

export interface GenerationData {
  id: string;
  total_cost: number;
  created_at: string;
  model: string;
  origin: string;
  usage: number;
  is_byok: boolean;
  upstream_id: string;
  cache_discount: number;
  app_id: number;
  streamed: boolean;
  cancelled: boolean;
  provider_name: string;
  latency: number;
  moderation_latency: number;
  generation_time: number;
  finish_reason: string;
  native_finish_reason: string;
  tokens_prompt: number;
  tokens_completion: number;
  native_tokens_prompt: number;
  native_tokens_completion: number;
  native_tokens_reasoning: number;
  num_media_prompt: number;
  num_media_completion: number;
  num_search_results: number;
}

export interface GenerationResponse {
  data: GenerationData;
}
