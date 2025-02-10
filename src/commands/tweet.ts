import { openrouterConfig } from "../config/config";
import { MAX_TWEET_LENGTH, MAX_TWEET_LENGTH_WITH_ANALYSIS } from "../constants"; // 定数をインポート
import { ConfigError } from "../errors/ConfigError";
import type { PromptConfig } from "../prompts/types";
import { runPython } from "../runPython";
import { OpenRouterService } from "../services/openrouter";
import { TwitterApiRateLimitError, sendTweet } from "../services/twitter";
import { type StockAnalysis, analyzeStock } from "../utils/analyzeStock";

// 銘柄コードを抽出する関数を追加
const extractStockCodes = (text: string): string[] => {
  const matches = text.match(/[0-9]{4}/g) || [];
  return [...new Set(matches)];
};

function getWeatherEmoji(growthRate: number, per: number): string {
  // 成長率を整数に
  const roundedGrowth = Math.round(growthRate);

  if (roundedGrowth > per) {
    return "☀️"; // 成長率がPERより高い場合は晴れ
  }
  if (roundedGrowth === per) {
    return "🌤️"; // 同じ場合は晴れ時々曇り
  }
  return "☁️"; // 成長率がPERより低い場合は曇り
}

export async function tweetCommand(options: {
  dryRun?: boolean;
  prompt: () => PromptConfig;
  dateRange?: { start: Date; end: Date };
  includeAnalysis?: boolean; // 分析情報を追加するかどうかのオプション
}) {
  try {
    const openrouter = new OpenRouterService(openrouterConfig);
    const tweet = await openrouter.generateTweet(options.prompt());

    console.log("生成されたツイート:", tweet);

    let finalTweet = tweet;

    // includeAnalysisがtrueで、ツイートがMAX_TWEET_LENGTH_WITH_ANALYSIS文字未満の場合のみ分析情報を追加
    if (
      options.includeAnalysis &&
      tweet.length < MAX_TWEET_LENGTH_WITH_ANALYSIS
    ) {
      // 銘柄コードの抽出と分析を追加
      const stockCodes = extractStockCodes(tweet);
      let analysisInfo = ""; // 分析情報を格納する変数

      if (stockCodes.length > 0) {
        console.log("検出された銘柄コード:", stockCodes);
        for (const code of stockCodes) {
          const { analysisInfo: stockAnalysisInfo } = await analyzeStock(code);
          // 各銘柄の分析情報を追加
          analysisInfo += stockAnalysisInfo;
        }
      }

      // 分析情報を追加
      finalTweet += analysisInfo;
    } else if (
      options.includeAnalysis &&
      tweet.length >= MAX_TWEET_LENGTH_WITH_ANALYSIS
    ) {
      console.log(
        `ツイートが${MAX_TWEET_LENGTH_WITH_ANALYSIS}文字以上のため、分析情報は追加しません`,
      );
    }

    console.log("最終的なツイート内容:", finalTweet);

    // 文字数を確認
    console.log("ツイートの文字数:", finalTweet.length);
    if (finalTweet.length > MAX_TWEET_LENGTH) {
      throw new Error(
        `ツイート内容が${MAX_TWEET_LENGTH}文字を超えています: ${finalTweet.length}文字`,
      );
    }

    if (options.dryRun) {
      console.log("[Dry Run] 実際のツイートは送信されません");
      console.log("最終的なツイート内容:", finalTweet);
      return;
    }

    await sendTweet(finalTweet);
    console.log("ツイートの投稿が完了しました");
  } catch (error) {
    if (error instanceof TwitterApiRateLimitError) {
      console.error("\n=== レート制限エラー ===");
      if (error.resetTime) {
        console.error(`制限解除時刻: ${error.resetTime.toLocaleString()}`);
      }
      console.error(error.message);
    } else if (error instanceof ConfigError) {
      console.error("設定エラー:", error.message);
      if (error.key) {
        console.error("問題のある環境変数:", error.key);
      }
      if (error.value) {
        console.error("詳細:", error.value);
      }
    } else {
      console.error("=== Twitter APIエラーの詳細 ===");
      console.error("エラーの型:", typeof error);
      console.error("エラーの構造:", JSON.stringify(error, null, 2));
      console.error("エラーのプロパティ一覧:", Object.keys(error as object));
      console.error("================================");

      const err = error as {
        rateLimit?: {
          limit: number;
          remaining: number;
          reset: number;
        };
        data?: {
          detail: string;
          title: string;
          type: string;
          reason: string;
        };
      };

      if (err.data?.detail) {
        console.error("Twitter APIエラー:", err.data.title);
        console.error("詳細:", err.data.detail);
        if (err.data.reason === "client-not-enrolled") {
          console.error(
            "API権限が不足しています。Twitter Developer Portalで権限を確認してください。",
          );
        }
      } else {
        console.error("Twitter APIエラー:", error);
      }
    }
    process.exit(1);
  }
}
