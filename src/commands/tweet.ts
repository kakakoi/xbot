import { openrouterConfig } from "../config/config";
import { ConfigError } from "../errors/ConfigError";
import { OpenRouterService } from "../services/openrouter";
import { TwitterApiRateLimitError, sendTweet } from "../services/twitter";
import { formatDateRange, getLastThursdayToSunday } from "../utils/dateUtils";

export async function tweetCommand(options: { dryRun?: boolean } = {}) {
  try {
    const dateRange = getLastThursdayToSunday();
    const dateRangeText = formatDateRange(dateRange.start, dateRange.end);
    console.log("直近の日曜日から木曜日までの日付:", dateRangeText);

    const openrouter = new OpenRouterService(openrouterConfig);
    const tweet = await openrouter.generateTweet({
      topic:
        "次の月曜日に買って金曜日までに株価が上昇しそうな日本株銘柄を1つ予想",
      mood: "分析的",
      context: `${dateRangeText}までに出た材料を考慮して、以下の点を含めて予想してください：
- 具体的な銘柄コードと会社名
- 直近の材料や決算内容
- 市場環境との関連性`,
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
