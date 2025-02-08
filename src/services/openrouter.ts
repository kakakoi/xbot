import { OpenRouterConfig, TweetGenerationPrompt } from '../types/openrouter';

export class OpenRouterService {
    private config: OpenRouterConfig;
    private baseURL: string;

    constructor(config: OpenRouterConfig) {
        this.config = config;
        this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
    }

    async generateTweet(prompt: TweetGenerationPrompt): Promise<string> {
        const systemPrompt = `あなたはTwitterのAIボットです。
- フレンドリーで親しみやすい口調で書いてください
- 280文字以内で書いてください
- ${prompt.topic || '一般的な話題'}について書いてください
- ${prompt.mood || '明るい'}トーンで書いてください
- ハッシュタグは${prompt.hashtags?.join(', ') || 'なし'}を使用してください`;

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/yourusername/xbot',
                'X-Title': 'XBot'
            },
            body: JSON.stringify({
                model: this.config.model,
                temperature: this.config.temperature,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: 'ツイートを1つ生成してください' }
                ]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content || 'ツイートの生成に失敗しました';
    }
}
