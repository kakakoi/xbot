import { openrouterConfig } from "../config/config";
import { ConfigError } from "../errors/ConfigError";
import { OpenRouterService } from "../services/openrouter";
import { sendTweet } from "../services/twitter";
import type { TwitterApiError } from "../types/twitter";

export async function tweetCommand() {
  try {
    const openrouter = new OpenRouterService(openrouterConfig);

    try {
      const tweet = await openrouter.generateTweet({
        topic: "先週の日本株で目立った銘柄3つ予想",
        mood: "楽しい",
      });

      console.log("生成されたツイート:", tweet);

      try {
        await sendTweet(tweet);
        console.log("ツイートの投稿が完了しました");
      } catch (twitterError) {
        const error = twitterError as TwitterApiError;
        if (error.code === 429) {
          throw new Error(
            "Twitter APIの制限に達しました。しばらく時間をおいて再実行してください。",
          );
        }
        throw error;
      }
    } catch (error) {
      throw new Error(
        `OpenRouter APIエラー: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error("設定エラー:", error.message);
      if (error.key) {
        console.error("問題のある環境変数:", error.key);
      }
      if (error.value) {
        console.error("詳細:", error.value);
      }
    }
    throw error;
  }
}
