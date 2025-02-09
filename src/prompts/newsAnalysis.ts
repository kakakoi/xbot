import { MAX_TWEET_LENGTH_WITH_ANALYSIS } from "../constants";

export const newsAnalysisPrompts = {
  marketImpact: (title: string) => ({
    topic: "経済ニュースの株式市場への影響分析",
    mood: "分析的",
    context: `
この経済ニュースが日本株式市場に与える影響を分析してください：
「${title}」

分析のポイント：
1. 株価への影響（ポジティブ/ネガティブ）
2. 影響を受けそうな業界や企業
3. 市場センチメントへの影響
4. 略称を重視、原文をより短くし${MAX_TWEET_LENGTH_WITH_ANALYSIS}文字以内、簡潔ながら情報量を維持を心がけてください。
`,
  }),

  selectRelevant: (titles: string[]) => ({
    topic: "株式市場に影響を与えるニュースの選択",
    mood: "分析的",
    context: `
以下の経済ニュースの中から、日本の株式市場に最も大きな影響を与えそうなものを1つ選んでください。
各ニュースのインデックス番号（0から始まる）を返してください。

ニュース一覧：
${titles.map((title, i) => `${i}: ${title}`).join("\n")}

選択基準：
1. 株価への直接的な影響度
2. 市場全体への波及効果
3. 投資家の関心度
`,
  }),
};
