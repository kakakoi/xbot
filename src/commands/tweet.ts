import { openrouterConfig } from "../config/config";
import { ConfigError } from "../errors/ConfigError";
import { stockAnalysisPrompts } from "../prompts/stockAnalysis";
import { weeklyPredictionPrompts } from "../prompts/weeklyPrediction";
import { runPython } from "../runPython";
import { OpenRouterService } from "../services/openrouter";
import { TwitterApiRateLimitError, sendTweet } from "../services/twitter";
import { formatDateRange, getLastThursdayToSunday } from "../utils/dateUtils";

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

export async function tweetCommand(options: { dryRun?: boolean } = {}) {
  try {
    const dateRange = getLastThursdayToSunday();
    const dateRangeText = formatDateRange(dateRange.start, dateRange.end);
    console.log("直近の日曜日から木曜日までの日付:", dateRangeText);

    const openrouter = new OpenRouterService(openrouterConfig);
    const tweet = await openrouter.generateTweet(
      weeklyPredictionPrompts.stockPick(dateRangeText),
    );

    console.log("生成されたツイート:", tweet);

    // 銘柄コードの抽出と分析を追加
    const stockCodes = extractStockCodes(tweet);
    let analysisInfo = ""; // 分析情報を格納する変数

    if (stockCodes.length > 0) {
      console.log("検出された銘柄コード:", stockCodes);
      for (const code of stockCodes) {
        const analysis = (await runPython(code)) as StockAnalysis;
        console.log(`銘柄${code}の分析結果:`, analysis);
        if (analysis.operatingIncomeGrowth !== undefined) {
          const analysisLines = [];

          // 営業利益成長率とPERを比較して天気マークを追加
          const weatherEmoji =
            analysis.per !== undefined
              ? getWeatherEmoji(analysis.operatingIncomeGrowth, analysis.per)
              : "";

          // 営業利益成長率
          const growthText = `分析:${weatherEmoji}\n営利成長${analysis.yearsCount}年平均 ${analysis.operatingIncomeGrowth >= 0 ? "+" : ""}${analysis.operatingIncomeGrowth.toFixed(2)}%`;
          analysisLines.push(growthText);

          // PER
          if (analysis.per !== undefined) {
            analysisLines.push(`PER ${analysis.per.toFixed(2)}倍`);
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
    console.log("最終的なツイート内容:", finalTweet); // ここにログを追加

    if (options.dryRun) {
      console.log("[Dry Run] 実際のツイートは送信されません");
      // 最終的なツイート内容を表示
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
      console.error("Twitter APIエラー:", error);
    }
    process.exit(1);
  }
}
