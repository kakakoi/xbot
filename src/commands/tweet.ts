import { openrouterConfig } from "../config/config";
import { ConfigError } from "../errors/ConfigError";
import { OpenRouterService } from "../services/openrouter";
import { TwitterApiRateLimitError, sendTweet } from "../services/twitter";

export async function tweetCommand(options: { dryRun?: boolean } = {}) {
  try {
    const openrouter = new OpenRouterService(openrouterConfig);
    const tweet = await openrouter.generateTweet({
      topic: "先週の日本株で目立った銘柄3つ予想",
      mood: "楽しい",
    });

    console.log("生成されたツイート:", tweet);

    if (options.dryRun) {
      console.log("[Dry Run] 実際のツイートは送信されません");
      return;
    }

    try {
      await sendTweet(tweet);
      console.log("ツイートの投稿が完了しました");
    } catch (error) {
      if (error instanceof TwitterApiRateLimitError) {
        console.error("\n=== レート制限エラー ===");
        if (error.resetTime) {
          console.error(`制限解除時刻: ${error.resetTime.toLocaleString()}`);
        }
        console.error(error.message);
      } else {
        console.error("Twitter APIエラー:", error);
      }
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
