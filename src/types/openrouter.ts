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
