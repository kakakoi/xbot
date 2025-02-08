import * as path from "node:path";
import * as ts from "typescript";

export function findUnusedFiles(rootDir = "src"): string[] {
  const configPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    "tsconfig.json",
  );

  if (!configPath) {
    throw new Error("tsconfig.json が見つかりません");
  }

  // TypeScriptの設定を読み込む
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options, fileNames } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath),
  );

  // プログラムの作成
  const program = ts.createProgram(fileNames, options);
  const checker = program.getTypeChecker();

  // ファイルの使用状況を追跡
  const usedFiles = new Set<string>();
  const allFiles = new Set<string>();

  // すべてのソースファイルをチェック
  for (const sourceFile of program.getSourceFiles()) {
    const filePath = sourceFile.fileName;

    // node_modulesは除外
    if (filePath.includes("node_modules")) {
      continue;
    }

    // プロジェクト内のファイルのみを対象
    if (filePath.startsWith(path.resolve(rootDir))) {
      allFiles.add(filePath);

      // インポート文を検索
      ts.forEachChild(sourceFile, (node) => {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
          const module = node.moduleSpecifier;
          if (module && ts.isStringLiteral(module)) {
            const resolvedPath = path.resolve(
              path.dirname(filePath),
              `${module.text}.ts`,
            );
            usedFiles.add(resolvedPath);
          }
        }
      });
    }
  }

  // 未使用のファイルを特定
  const unusedFiles = Array.from(allFiles)
    .filter((file) => !usedFiles.has(file))
    // パスを相対パスに変換
    .map((file) => path.relative(process.cwd(), file));

  return unusedFiles;
}
