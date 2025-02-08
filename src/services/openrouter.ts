import type {
  OpenRouterConfig,
  TweetGenerationPrompt,
} from '../types/openrouter';

export class OpenRouterService {
  private config: OpenRouterConfig;
  private baseURL: string;

  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
  }

  async generateTweet(prompt: TweetGenerationPrompt): Promise<string> {
    const systemPrompt = `あなたは日本語でツイートするAIボットです。以下の条件に従ってツイートを生成してください：

- 自然な日本語で書く
- カジュアルでフレンドリーな口調を使う
- 絵文字を適度に使用する
- 280文字以内で書く
- トピック：${prompt.topic || '一般的な話題'}
- トーン：${prompt.mood || '明るい'}

以下のような表現は避けてください：
- 過度に形式的な言い回し
- 不自然な翻訳調の日本語
- 過度な敬語`;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/yourusername/xbot',
        'X-Title': 'XBot',
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: '今の気分で自然なツイートを1つ生成してください',
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content || 'ツイートの生成に失敗しました';
  }
}
