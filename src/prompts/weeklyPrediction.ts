export const weeklyPredictionPrompts = {
  stockPick: (dateRange: string) => ({
    topic:
      "次の月曜日に買って金曜日までに株価が上昇しそうな日本株銘柄を1つ予想",
    mood: "分析的",
    context: `
次の月曜日に買って金曜日までに株価が上昇しそうな日本株銘柄を1つ予想してください。

${dateRange}までに出た材料を考慮して、以下の点を含めて予想してください：
- 具体的な銘柄コードと会社名
- 直近の材料や決算内容
- 市場環境との関連性
`,
  }),
};
