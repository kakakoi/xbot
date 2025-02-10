import { runPython } from "../runPython";
import { formatStockAnalysis } from "./formatStockAnalysis";

export interface StockAnalysis {
  code: string;
  name: string;
  analysis: string;
  operatingIncomeGrowth?: number;
  yearlyGrowthRates?: number[];
  yearsInfo?: string[]; // 年度情報を追加
  yearsCount: number;
  per?: number;
  error?: string;
}

// 銘柄コードの分析を行う関数
export async function analyzeStock(stockCode: string): Promise<{
  analysisInfo: string;
  analysis: StockAnalysis;
}> {
  const analysis = (await runPython(stockCode)) as StockAnalysis;
  console.log(`銘柄${stockCode}の分析結果:`, analysis);

  // 分析情報を装飾
  const analysisInfo = formatStockAnalysis(stockCode, analysis);
  console.log(`銘柄${stockCode}の分析情報:\n${analysisInfo}`);

  // 年度別成長率のログ出力
  if (analysis.yearlyGrowthRates) {
    console.log(
      `銘柄${stockCode}の年度別成長率（直近${analysis.yearsCount}年間）:`,
      analysis.yearlyGrowthRates
        .map((rate) => `${rate.toFixed(2)}%`)
        .join(", "),
    );
  }

  // エラーがあれば出力
  if (analysis.error) {
    console.error(`銘柄${stockCode}の取得エラー:`, analysis.error);
  }

  return { analysisInfo, analysis };
}
