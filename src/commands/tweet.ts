import { openrouterConfig } from "../config/config";
import { MAX_TWEET_LENGTH } from "../constants"; // 定数をインポート
import { ConfigError } from "../errors/ConfigError";
import type { PromptConfig } from "../prompts/types";
import { runPython } from "../runPython";
import { OpenRouterService } from "../services/openrouter";
import { TwitterApiRateLimitError, sendTweet } from "../services/twitter";

// 銘柄コードを抽出する関数を追加
const extractStockCodes = (text: string): string[] => {
  const matches = text.match(/[0-9]{4}/g) || [];
  return [...new Set(matches)];
};

interface StockAnalysis {
  code: string;
  analysis: string;
  operatingIncomeGrowth?: number;
  yearlyGrowthRates?: number[];
  yearsCount: number;
  per?: number;
  error?: string;
}

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
}) {
  try {
    const openrouter = new OpenRouterService(openrouterConfig);
    const tweet = await openrouter.generateTweet(options.prompt());

    console.log("生成されたツイート:", tweet);

    // 銘柄コードの抽出と分析を追加
    const stockCodes = extractStockCodes(tweet);
    let analysisInfo = ""; // 分析情報を格納する変数

    if (stockCodes.length > 0) {
      console.log("検出された銘柄コード:", stockCodes);
      for (const code of stockCodes) {
        const analysis = (await runPython(code)) as StockAnalysis;
        console.log(`銘柄${code}の分析結果:`, analysis);
        if (
          analysis.operatingIncomeGrowth !== undefined &&
          analysis.operatingIncomeGrowth !== null
        ) {
          const analysisLines = [];

          // 営業利益成長率とPERを比較して天気マークを追加
          const weatherEmoji =
            analysis.per !== undefined && analysis.per !== null
              ? getWeatherEmoji(analysis.operatingIncomeGrowth, analysis.per)
              : "";

          // 営業利益成長率
          const growthText = `分析(${code}):${weatherEmoji}\n営利成長${analysis.yearsCount}年平均 +${Math.floor(analysis.operatingIncomeGrowth)}%`;
          analysisLines.push(growthText);

          // PER
          if (analysis.per !== undefined && analysis.per !== null) {
            analysisLines.push(`PER ${Math.floor(analysis.per)}倍`);
          }

          analysisInfo = `\n${analysisLines.join("\n")}`;
          console.log(`銘柄${code}の分析情報:\n${analysisInfo}`);
        }
        if (analysis.yearlyGrowthRates) {
          console.log(
            `銘柄${code}の年度別成長率（直近${analysis.yearsCount}年間）:`,
            analysis.yearlyGrowthRates
              .map((rate) => `${rate.toFixed(2)}%`)
              .join(", "),
          );
        }
        if (analysis.error) {
          console.error(`銘柄${code}の取得エラー:`, analysis.error);
        }
      }
    }

    // 分析情報を追加してツイート
    const finalTweet = tweet + analysisInfo;
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
