import type { StockAnalysis } from "./analyzeStock";

function getWeatherEmoji(growthRate: number, per: number): string {
  const roundedGrowth = Math.round(growthRate);
  if (roundedGrowth > per) {
    return "☀️"; // 成長率がPERより高い場合は晴れ
  }
  if (roundedGrowth === per) {
    return "🌤️"; // 同じ場合は晴れ時々曇り
  }
  return "☁️"; // 成長率がPERより低い場合は曇り
}

// 分析結果を装飾する関数
export const formatStockAnalysis = (
  stockCode: string,
  analysis: StockAnalysis,
): string => {
  let formattedText = ""; // 装飾されたテキストを格納する変数

  if (
    analysis.operatingIncomeGrowth !== undefined &&
    analysis.operatingIncomeGrowth !== null
  ) {
    const weatherEmoji =
      analysis.per !== undefined && analysis.per !== null
        ? getWeatherEmoji(analysis.operatingIncomeGrowth, analysis.per)
        : "";

    const growthText = `将来性(${stockCode}):${weatherEmoji}\n営利成長${analysis.yearsCount}年平均 ${Math.floor(analysis.operatingIncomeGrowth)}%`;
    formattedText = `\n${growthText}`;

    if (analysis.per !== undefined && analysis.per !== null) {
      formattedText += `\nPER ${Math.floor(analysis.per)}倍`;
    }
  }

  return formattedText;
};
