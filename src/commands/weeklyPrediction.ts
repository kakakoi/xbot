import { weeklyPredictionPrompts } from "../prompts/weeklyPrediction";
import { formatDateRange, getLastThursdayToSunday } from "../utils/dateUtils";
import { tweetCommand } from "./tweet";

export async function weeklyPredictionCommand(
  options: { dryRun?: boolean } = {},
) {
  const dateRange = getLastThursdayToSunday();
  const dateRangeText = formatDateRange(dateRange.start, dateRange.end);

  await tweetCommand({
    ...options,
    prompt: () => weeklyPredictionPrompts.stockPick(dateRangeText),
    dateRange,
    includeAnalysis: true,
  });
}
