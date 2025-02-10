import { sectorPredictionPrompts } from "../prompts/sectorPrediction";
import { tweetCommand } from "./tweet";

export async function sectorPredictionCommand(
  options: { dryRun?: boolean } = {},
) {
  await tweetCommand({
    ...options,
    prompt: () => sectorPredictionPrompts.sectorPick(),
    includeAnalysis: true,
  });
}
