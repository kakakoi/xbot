#!/bin/bash

VENV_DIR="$(dirname "$0")/../.venv"

# 仮想環境のセットアップ
setup_venv() {
    echo "Setting up Python virtual environment..."
    python3 -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    python3 -m pip install --upgrade pip
}

# 依存関係のインストール
install_dependencies() {
    echo "Installing Python dependencies..."
    python3 -m pip install -r "$(dirname "$0")/../requirements.txt"
}

# メイン処理
if [ ! -d "$VENV_DIR" ]; then
    setup_venv
fi

source "$VENV_DIR/bin/activate"
if install_dependencies; then
    echo "Dependencies installed successfully"
    exit 0
else
    echo "Failed to install Python dependencies"
    echo "Please try manually: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi
