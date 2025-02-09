import { TwitterApi } from "twitter-api-v2";
import { config } from "../config/config";
import { MAX_TWEET_LENGTH } from "../constants"; // 定数をインポート
import type { TwitterConfig } from "../types/config";

export class TwitterApiRateLimitError extends Error {
  constructor(
    message: string,
    public readonly resetTime?: Date,
  ) {
    super(message);
    this.name = "TwitterApiRateLimitError";
  }
}

export class TwitterService {
  private client: TwitterApi;

  constructor(config: TwitterConfig) {
    this.client = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecretKey,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret,
    });
  }

  async tweet(text: string): Promise<void> {
    try {
      // デバッグ情報を出力
      console.log("=== Twitter API デバッグ情報 ===");
      console.log("アクセストークン:", config.twitter.accessToken);
      console.log("ツイート内容:", text);
      console.log("ツイート文字数:", text.length);

      // 文字数を確認
      if (text.length > MAX_TWEET_LENGTH) {
        throw new Error(
          `ツイート内容が${MAX_TWEET_LENGTH}文字を超えています: ${text.length}文字`,
        );
      }

      // ユーザー情報を取得してアクセス権限を確認
      const me = await this.client.v2.me();
      console.log("認証済みユーザー:", me.data);

      await this.client.v2.tweet(text);
    } catch (error) {
      const apiError = error as {
        code?: number;
        data?: {
          detail: string;
          status: number;
          title: string;
          type: string;
          reason?: string;
        };
        rateLimit?: {
          reset?: number;
        };
      };

      if (apiError.code === 429) {
        const resetTime = apiError.rateLimit?.reset
          ? new Date(apiError.rateLimit.reset * 1000)
          : undefined;

        throw new TwitterApiRateLimitError(
          "Twitter APIの制限に達しました。しばらく時間をおいて再実行してください。",
          resetTime,
        );
      }

      if (apiError.data) {
        console.error("=== Twitter API エラー詳細 ===");
        console.error("ステータス:", apiError.data.status);
        console.error("タイトル:", apiError.data.title);
        console.error("詳細:", apiError.data.detail);
        console.error("タイプ:", apiError.data.type);
        if (apiError.data.reason) {
          console.error("理由:", apiError.data.reason);
        }
        console.error("===========================");

        throw new Error(
          `Twitter APIエラー: ${apiError.data.title} - ${apiError.data.detail}`,
        );
      }
      throw error;
    }
  }
}

// エクスポートする関数
export async function sendTweet(text: string): Promise<void> {
  const service = new TwitterService(config.twitter);
  await service.tweet(text);
}
