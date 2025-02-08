import { TwitterApi } from "twitter-api-v2";
import { config } from "../config/config";
import type { TwitterApiError } from "../types/twitter";

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

  constructor() {
    this.client = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecretKey,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret,
    });
  }

  async tweet(text: string): Promise<string> {
    try {
      console.log("アカウント情報を確認中...");
      const me = await this.client.v2.me();
      console.log(`認証成功: @${me.data.username}`);

      const tweet = await this.client.v2.tweet(text);
      console.log("ツイート成功:", tweet.data);
      return tweet.data.id;
    } catch (error) {
      const twitterError = error as TwitterApiError;

      if (twitterError.code === 429) {
        const resetTime = twitterError.rateLimit?.reset
          ? new Date(twitterError.rateLimit.reset * 1000)
          : undefined;

        throw new TwitterApiRateLimitError(
          "Twitter APIの制限に達しました。しばらく時間をおいて再実行してください。",
          resetTime,
        );
      }

      // その他のエラー
      throw new Error(
        `Twitter APIエラー: ${twitterError.message || "不明なエラー"}`,
      );
    }
  }
}

// エクスポートする関数
export async function sendTweet(text: string): Promise<string> {
  const service = new TwitterService();
  return service.tweet(text);
}
