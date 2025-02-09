import type {
  GenerationResponse,
  OpenRouterCompletion,
  OpenRouterConfig,
  TweetGenerationPrompt,
} from "../types/openrouter";
import { BaseService } from "./base";

export class OpenRouterService extends BaseService {
  private baseURL: string;

  constructor(private config: OpenRouterConfig) {
    super();
    this.baseURL = "https://openrouter.ai/api/v1";
  }

  async generateTweet(prompt: TweetGenerationPrompt): Promise<string> {
    const completion = await this.createCompletion(prompt);
    const generationInfo = await this.getGenerationInfo(completion.id);
    await this.logGenerationDetails(generationInfo.data);
    return completion.choices[0].message.content;
  }

  private createSystemPrompt(prompt: TweetGenerationPrompt): string {
    return `あなたは日本株の市場分析を行うAIです。
- すべての文章を日本語で書く（英単語や他の言語を混ぜない）
- ただし、GDP、ETF、FOMC などの経済略語は使用してよい
- 具体的な企業名や銘柄コードを必ず含める
- 略称（USS, ORCL, TSLA など）が複数の企業に該当する場合は、適切な企業を識別する。
   - 例: 「USS」は 日本のUSS（4732）と米国のU.S. Steel のどちらかを確認する。
- 事実のみを簡潔に伝える
- 分析的かつ論理的な表現を使用する
- 感情的・フレンドリーな表現を避ける
- 200文字以内で書く（分析データが追加されるため）
- 絶対にハッシュタグを含めない
- 結論を明確にし、推測ではなく根拠に基づく予測を行う
- 日付や具体的な数字を含めず、「最近」「直近」など雰囲気で表現する
- 踊り字（々）は使用しない
- twetterで投稿するので、マークダウン形式の強調などは使用しない
- トピック：${prompt.topic || "一般的な話題"}
- トーン：${prompt.mood || "分析的"}
- 追加のコンテキスト：${prompt.context || "なし"}`;
  }

  private async createCompletion(
    prompt: TweetGenerationPrompt,
  ): Promise<OpenRouterCompletion> {
    const systemPrompt = this.createSystemPrompt(prompt);
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "今の気分で自然なツイートを1つ生成してください",
          },
        ],
      }),
    });

    return this.handleResponse<OpenRouterCompletion>(response);
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
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        });

        if (response.status === 404 && attempt < retries) {
          console.log("生成情報がまだ利用できません。リトライします。");
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

    throw new Error("生成情報の取得に失敗: リトライ回数超過");
  }

  private async logGenerationDetails(data: GenerationResponse["data"]) {
    try {
      console.log("\n生成詳細情報:");

      // 必須項目の存在確認
      if (data.model && data.provider_name) {
        console.log(`- モデル: ${data.model} (${data.provider_name})`);
      }
      if (data.generation_time) {
        console.log(`- 生成時間: ${data.generation_time}ms`);
      }

      if (data.tokens_prompt || data.tokens_completion) {
        console.log("\nトークン情報:");
        if (data.tokens_prompt) {
          console.log(`- プロンプト: ${data.tokens_prompt}トークン`);
        }
        if (data.tokens_completion) {
          console.log(`- 生成結果: ${data.tokens_completion}トークン`);
        }
      }

      if (data.total_cost !== undefined) {
        console.log("\nコスト情報:");
        console.log(`- 合計コスト: $${data.total_cost.toFixed(6)}`);
        if (data.cache_discount && data.cache_discount > 0) {
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
        console.log("\n完了理由:");
        console.log(`- OpenRouter: ${data.finish_reason}`);
        console.log(`- プロバイダー: ${data.native_finish_reason}`);
      }
    } catch (error) {
      console.error(
        "生成情報の取得に失敗:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
