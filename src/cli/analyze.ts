import { findUnusedFiles } from "../utils/analyzeImports";

async function main() {
  try {
    const unusedFiles = findUnusedFiles();
    if (unusedFiles.length > 0) {
      console.log("未使用のファイルが見つかりました:");
      for (const file of unusedFiles) {
        console.log(`- ${file}`);
      }
      process.exit(1);
    } else {
      console.log("未使用のファイルは見つかりませんでした。");
    }
  } catch (error) {
    console.error("分析中にエラーが発生しました:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
