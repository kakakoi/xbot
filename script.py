import json
import sys
import yfinance as yf
import pandas as pd
import numpy as np
import traceback

def is_valid_number(x):
    """数値が有効かどうかをチェック"""
    return not (pd.isna(x) or np.isnan(x) if isinstance(x, (float, np.floating)) else False)

def clean_growth_rates(rates):
    """成長率リストから無効な値を除去"""
    return [float(rate) for rate in rates if is_valid_number(rate)]

def calculate_growth_rate(data):
    """営業利益の成長率を計算"""
    growth_rates = []
    available_years = data.index
    years = available_years[:min(5, len(available_years))]
    
    for i in range(1, len(years)):
        prev = data[years[i]]
        curr = data[years[i-1]]
        if prev != 0 and is_valid_number(prev) and is_valid_number(curr):
            growth_rate = ((curr - prev) / prev) * 100
            growth_rates.append(growth_rate)
    
    # 無効な値を除去
    valid_rates = clean_growth_rates(growth_rates)
    return valid_rates, len(valid_rates)

def analyze_stock_code(code=None):
    if code:
        try:
            ticker = yf.Ticker(f"{code}.T")
            financials = ticker.financials
            info = ticker.info  # 銘柄情報を取得
            
            avg_growth = None
            years_count = 0
            if not financials.empty and "Operating Income" in financials.index:
                growth_rates, years_count = calculate_growth_rate(financials.loc["Operating Income"])
                avg_growth = sum(growth_rates) / len(growth_rates) if growth_rates else None
            
            # PERを取得
            per = info.get("trailingPE") or info.get("forwardPE")
            
            result = {
                "code": code,
                "analysis": f"銘柄{code}の分析結果",
                "operatingIncomeGrowth": float(avg_growth) if avg_growth is not None and is_valid_number(avg_growth) else None,
                "yearlyGrowthRates": growth_rates if 'growth_rates' in locals() else None,
                "yearsCount": years_count,
                "per": float(per) if per is not None and is_valid_number(per) else None
            }
            return result
        except Exception as e:
            print(f"DEBUG: Error occurred: {str(e)}", file=sys.stderr)
            print(f"DEBUG: Traceback: {traceback.format_exc()}", file=sys.stderr)
            return {
                "code": code,
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
        json_output = json.dumps(result, ensure_ascii=False)
        print(json_output)  # 標準出力に結果を出力
    except Exception as e:
        print(f"DEBUG: Main error: {str(e)}", file=sys.stderr)
        print(json.dumps({"error": str(e)}))  # エラーの場合も有効なJSONを出力
