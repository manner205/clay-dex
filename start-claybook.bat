@echo off
title 클레이 도감 서버
cd /d "d:\Claude-code-app\clay-book"
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
pause
