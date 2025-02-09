import { newsCommand } from "./commands/news";
import { sectorPredictionCommand } from "./commands/sectorPrediction";
import { tweetCommand } from "./commands/tweet";
import { weeklyPredictionCommand } from "./commands/weeklyPrediction";
import { findUnusedFiles } from "./utils/analyzeImports";

async function main() {
  const command = process.argv[2];
  const isDryRun = process.argv.includes("--dry-run");

  switch (command) {
    case "tweet":
      console.error("使用方法: npm run weekly または npm run news");
      process.exit(1);
      break;
    case "news":
      await newsCommand({ dryRun: isDryRun });
      break;
    case "analyze": {
      const unusedFiles = findUnusedFiles();
      if (unusedFiles.length > 0) {
        console.log("未使用のファイルが見つかりました:");
        for (const file of unusedFiles) {
          console.log(`- ${file}`);
        }
        process.exit(1);
      }
      console.log("未使用のファイルは見つかりませんでした。");
      break;
    }
    case "sector":
      await sectorPredictionCommand({ dryRun: isDryRun });
      break;
    case "weekly":
      await weeklyPredictionCommand({ dryRun: isDryRun });
      break;
    default:
      console.error("使用方法: npm start <command>");
      console.error("利用可能なコマンド:");
      console.error("  tweet   - AIでツイートを生成して投稿");
      console.error("  news    - ニュース記事をAIコメント付きで投稿");
      console.error("  analyze - 未使用ファイルを分析");
      console.error("  weekly  - 週次予測を実行");
      console.error("  sector  - セクター分析を実行");
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  });
}

export { tweetCommand, newsCommand, findUnusedFiles };
