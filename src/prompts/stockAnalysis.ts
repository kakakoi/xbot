import type { StockAnalysis } from "../utils/analyzeStock";
import type { PromptConfig } from "./types";

export const stockAnalysisPrompts = {
  stockAnalysis: (analysis: StockAnalysis): PromptConfig => ({
    topic: `${analysis.name}(${analysis.code})の財務分析`,
    mood: "analytical",
    context: `
端的かつインパクトのある表現で、SNS向けにキャッチーにする.言語は日本語、以下の点を含めて予測してください
- 営業利益${analysis.yearsCount}年平均成長率は${Math.floor(analysis.operatingIncomeGrowth || 0)}%
- PERは${Math.floor(analysis.per || 0)}倍です。
- 年度間のデータ yearsInfo: ${analysis.yearsInfo} / yearlyGrowthRates: ${analysis.yearlyGrowthRates}
- この銘柄の日本語名を書き出してください。漢字があれば漢字で書き出す。
- 今年の展望を四季報の企業概要風に解説して。
- この企業のセクターと今後3～6ヶ月の見通し
- その後に分析情報をもとにファンダメンタルを評価してください
- リスク管理戦略を示してください

略称を重視、原文をより短くし140文字以内、簡潔ながら情報量を維持を心がけてください。
`,
  }),
};
