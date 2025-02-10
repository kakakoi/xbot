import { stockAnalysisPrompts } from "../prompts/stockAnalysis";
import { runPython } from "../runPython";
import type { StockAnalysis } from "../utils/analyzeStock";
import { tweetCommand } from "./tweet";

export async function stockAnalysisCommand(
  options: { dryRun?: boolean } = {},
  stockCode?: string,
) {
  if (!stockCode) {
    throw new Error("銘柄コードを指定してください。");
  }

  // 分析を実行
  const analysis = (await runPython(stockCode)) as StockAnalysis;
  console.log("生成された分析情報:", analysis);

  // ツイートを生成して投稿
  await tweetCommand({
    ...options,
    prompt: () => stockAnalysisPrompts.stockAnalysis(analysis),
    includeAnalysis: true,
  });
}
