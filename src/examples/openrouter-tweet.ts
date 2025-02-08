import { openrouterConfig } from "../config/config";
import { ConfigError } from "../errors/ConfigError";
import { OpenRouterService } from "../services/openrouter";
import type { TwitterApiError } from "../types/twitter";
import { sendTweet } from "./tweet";

async function generateAndTweet() {
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
      } catch (twitterError) {
        const error = twitterError as TwitterApiError;
        if (error.code === 429) {
          console.error(
            "Twitter APIの制限に達しました。しばらく時間をおいて再実行してください。",
          );
        } else {
          console.error("Twitter APIエラー:", error);
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(
        "OpenRouter APIエラー:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
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
    } else {
      console.error("エラーが発生しました:", error);
    }
    process.exit(1);
  }
}

generateAndTweet().catch(console.error);

export { generateAndTweet };
