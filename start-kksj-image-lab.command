#!/bin/zsh
cd "$(dirname "$0")"

echo "AI Mint Studio"
echo "Paste your KKSJ API key, then press Enter."
echo "The key will stay in this terminal session only."
read -rs "KKSJ_API_KEY?"
echo

export KKSJ_API_KEY
export AI_IMAGE_BASE_URL="https://api.kksj.org/v1"
export IMAGE_MODEL="dall-e-3"
export IMAGE_QUALITY="standard"
export IMAGE_SIZE="1024x1024"

echo "Starting Image Lab..."
node server.mjs
