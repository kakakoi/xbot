import json
import sys
import yfinance as yf
import pandas as pd
import numpy as np
import traceback
from typing import TypedDict, Optional, List

def is_valid_number(x):
    """数値が有効かどうかをチェック"""
    return not (pd.isna(x) or np.isnan(x) if isinstance(x, (float, np.floating)) else False)

def clean_growth_rates(rates):
    """成長率リストから無効な値を除去"""
    return [float(rate) for rate in rates if is_valid_number(rate)]

def calculate_growth_rate(data):
    """営業利益の成長率を計算"""
    growth_rates = []
    years_info = []  # 年度情報を格納するリスト
    available_years = data.index
    years = available_years[:min(5, len(available_years))]
    
    for i in range(1, len(years)):
        prev = data[years[i]]
        curr = data[years[i-1]]
        prev_year = str(years[i])[:4]  # YYYY-MM-DD から年だけ取得
        curr_year = str(years[i-1])[:4]
        
        # デバッグ出力を stderr に変更
        
        if prev != 0 and is_valid_number(prev) and is_valid_number(curr):
            growth_rate = ((curr - prev) / prev) * 100
            growth_rates.append(growth_rate)
            years_info.append(f"{prev_year}→{curr_year}")
            print(f"成長率: {growth_rate:.2f}% 年度: {prev_year}→{curr_year} (前年度: {prev}, 当年度: {curr})", file=sys.stderr)
    
    # 無効な値を除去
    valid_rates = clean_growth_rates(growth_rates)
    return valid_rates, len(valid_rates), years_info

class StockAnalysisResult(TypedDict):
    code: Optional[str]
    name: Optional[str]
    analysis: str
    operatingIncomeGrowth: Optional[float]
    yearlyGrowthRates: Optional[List[float]]
    yearsInfo: Optional[List[str]]  # 年度情報を追加
    yearsCount: int
    per: Optional[float]

def analyze_stock_code(code: Optional[str] = None) -> StockAnalysisResult:
    if code:
        try:
            ticker = yf.Ticker(f"{code}.T")
            financials = ticker.financials
            info = ticker.info
            
            avg_growth = None
            years_count = 0
            years_info = []
            if not financials.empty and "Operating Income" in financials.index:
                growth_rates, years_count, years_info = calculate_growth_rate(financials.loc["Operating Income"])
                avg_growth = sum(growth_rates) / len(growth_rates) if growth_rates else None
            
            result: StockAnalysisResult = {
                "code": code,
                "name": info.get("shortName"),
                "analysis": f"銘柄{code}の分析結果",
                "operatingIncomeGrowth": float(avg_growth) if avg_growth is not None and is_valid_number(avg_growth) else None,
                "yearlyGrowthRates": growth_rates if 'growth_rates' in locals() else None,
                "yearsInfo": years_info,  # 年度情報を追加
                "yearsCount": years_count,
                "per": float(per) if (per := info.get("trailingPE") or info.get("forwardPE")) is not None and is_valid_number(per) else None
            }
            return result
        except Exception as e:
            print(f"DEBUG: Error occurred: {str(e)}", file=sys.stderr)
            print(f"DEBUG: Traceback: {traceback.format_exc()}", file=sys.stderr)
            return {
                "code": code,
                "name": None,
                "analysis": f"銘柄{code}の分析結果",
                "error": str(e)
            }
    else:
        return {
            "message": "Hello from Python!",
            "value": 42
        }

if __name__ == "__main__":
    try:
        code = sys.argv[1] if len(sys.argv) > 1 else None
        result = analyze_stock_code(code)
        # デバッグ出力を stderr に出力
        print(f"DEBUG: Result before JSON: {result}", file=sys.stderr)
        json_output = json.dumps(result, ensure_ascii=False)
        print(f"DEBUG: JSON output: {json_output}", file=sys.stderr)
        print(json_output)  # 標準出力に結果を出力
    except Exception as e:
        print(f"DEBUG: Main error: {str(e)}", file=sys.stderr)
        print(f"DEBUG: Traceback: {traceback.format_exc()}", file=sys.stderr)
        error_json = json.dumps({"error": str(e)})
        print(f"DEBUG: Error JSON: {error_json}", file=sys.stderr)
        print(error_json)  # エラーの場合も有効なJSONを出力
