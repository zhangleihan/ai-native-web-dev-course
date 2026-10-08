#!/bin/sh
set -eu
cd "$(dirname "$0")"
python3 scripts/build_course.py
echo "打开 http://127.0.0.1:8766"
python3 -m http.server 8766 --bind 127.0.0.1
