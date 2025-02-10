import { execFile } from "node:child_process";
import path from "node:path";

interface PythonResponse {
  code?: string;
  name?: string;
  analysis?: string;
  operatingIncomeGrowth?: number;
  yearlyGrowthRates?: number[];
  yearsCount?: number;
  per?: number;
  error?: string;
  message?: string;
  value?: number;
}

export const runPython = async (
  stockCode?: string,
): Promise<PythonResponse> => {
  const scriptPath = path.join(__dirname, "..", "script.py");
  const venvPythonPath = path.join(__dirname, "..", ".venv", "bin", "python3");
  const args = stockCode ? [scriptPath, stockCode] : [scriptPath];

  return new Promise((resolve, reject) => {
    execFile(venvPythonPath, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`実行エラー: ${error.message}`));
        return;
      }

      // デバッグ出力を常に表示するように変更
      if (stderr) {
        console.debug("Python debug output:", stderr);
      }

      try {
        // デバッグ用に stdout の内容も表示
        console.debug("Python stdout:", stdout);
        resolve(JSON.parse(stdout.trim()));
      } catch (e) {
        console.error("JSON parse error. Output was:", stdout);
        reject(new Error("JSONパースエラー"));
      }
    });
  });
};

// 使用例
async function main() {
  try {
    const result = await runPython();
    console.log("Basic result:", result);

    const stockResult = await runPython("1234");
    console.log("Stock analysis:", stockResult);
  } catch (error) {
    console.error("Error:", error);
  }
}

if (require.main === module) {
  main();
}
