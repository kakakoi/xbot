import { MAX_TWEET_LENGTH_WITH_ANALYSIS } from "../constants";
import type { PromptConfig } from "./types";

export const sectorPredictionPrompts: Record<string, () => PromptConfig> = {
  sectorPick: () => ({
    topic: "今後3～6ヶ月で注目すべき、日本株セクターの買い場予測",
    mood: "端的かつインパクトのある表現で、SNS向けにキャッチーにする.言語は日本語",
    context: `
今後3～6ヶ月で注目すべき一時的に割安ながら次のセクターローテーションで上昇が期待できる日本株セクターについて、以下の点を含めて予測してください：

- セクター名と注目理由
- 割安性（調整局面、需給歪み、低PER/PBRなど）
- 回復要因（政策支援、景気回復、資金流入など）
- 代表的な1つの銘柄（銘柄コード付き）
- 具体的な買い場とリスク管理戦略

略称を重視、原文をより短くし${MAX_TWEET_LENGTH_WITH_ANALYSIS}文字以内、簡潔ながら情報量を維持を心がけてください。
`,
  }),
};
