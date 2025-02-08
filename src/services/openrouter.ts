import type {
  GenerationResponse,
  OpenRouterConfig,
  OpenRouterKey,
  OpenRouterResponse,
  TweetGenerationPrompt,
} from '../types/openrouter';

export class OpenRouterService {
  private config: OpenRouterConfig;
  private baseURL: string;

  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getGenerationInfo(
    id: string,
    retries = 3,
    delay = 2000,
  ): Promise<GenerationResponse> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const url = `${this.baseURL}/generation?id=${encodeURIComponent(id)}`;
      console.log(`Generation情報取得試行 ${attempt}/${retries}`);

      try {
        // 最初の試行以外は待機
        if (attempt > 1) {
          console.log(`${delay / 1000}秒待機...`);
          await this.sleep(delay);
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        });

        if (response.status === 404 && attempt < retries) {
          console.log('生成情報がまだ利用できません。リトライします。');
          continue;
        }

        const responseBody = await response.text();
        if (!response.ok) {
          throw new Error(
            `${response.status} ${response.statusText}\nBody: ${responseBody}`,
          );
        }

        return JSON.parse(responseBody);
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`生成情報の取得に失敗: ${error}`);
        }
        console.log(`エラーが発生しました。リトライします: ${error}`);
      }
    }

    throw new Error('生成情報の取得に失敗: リトライ回数超過');
  }

  private async logGenerationDetails(id: string) {
    try {
      const genInfo = await this.getGenerationInfo(id);
      if (!genInfo?.data) {
        console.error('生成情報が不正な形式です:', genInfo);
        return;
      }

      const { data } = genInfo;
      console.log('\n生成詳細情報:');

      // 必須項目の存在確認
      if (data.model && data.provider_name) {
        console.log(`- モデル: ${data.model} (${data.provider_name})`);
      }
      if (data.generation_time) {
        console.log(`- 生成時間: ${data.generation_time}ms`);
      }

      if (data.tokens_prompt || data.tokens_completion) {
        console.log('\nトークン情報:');
        if (data.tokens_prompt) {
          console.log(`- プロンプト: ${data.tokens_prompt}トークン`);
        }
        if (data.tokens_completion) {
          console.log(`- 生成結果: ${data.tokens_completion}トークン`);
        }
      }

      if (data.total_cost !== undefined) {
        console.log('\nコスト情報:');
        console.log(`- 合計コスト: $${data.total_cost.toFixed(6)}`);
        if (data.cache_discount > 0) {
          console.log(
            `- キャッシュ割引: ${(data.cache_discount * 100).toFixed(1)}%`,
          );
        }
      }

      if (
        data.finish_reason &&
        data.native_finish_reason &&
        data.finish_reason !== data.native_finish_reason
      ) {
        console.log('\n完了理由:');
        console.log(`- OpenRouter: ${data.finish_reason}`);
        console.log(`- プロバイダー: ${data.native_finish_reason}`);
      }
    } catch (error) {
      console.error(
        '生成情報の取得に失敗:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async generateTweet(prompt: TweetGenerationPrompt): Promise<string> {
    console.log('使用モデル:', this.config.model);

    const systemPrompt = `あなたは日本語でツイートするAIボットです。以下の条件に従ってツイートを生成してください：

- 自然な日本語で書く
- カジュアルでフレンドリーな口調を使う
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

    const data = (await response.json()) as OpenRouterResponse;

    // レスポンスIDを出力
    console.log('\nレスポンス情報:');
    console.log(`- ID: ${data.id}`);

    // 生成情報を取得して表示
    await this.logGenerationDetails(data.id);

    return data.choices[0].message.content || 'ツイートの生成に失敗しました';
  }
}
