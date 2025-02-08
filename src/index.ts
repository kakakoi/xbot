import { tweetCommand } from "./commands/tweet";
import { findUnusedFiles } from "./utils/analyzeImports";

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "tweet":
      await tweetCommand();
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
    default:
      console.error("使用方法: npm start <command>");
      console.error("利用可能なコマンド:");
      console.error("  tweet   - AIでツイートを生成して投稿");
      console.error("  analyze - 未使用ファイルを分析");
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  });
}

export { tweetCommand, findUnusedFiles };
