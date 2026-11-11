@echo off
title SilkWay Travel Uzbekistan - Global Online Server
echo =========================================================
echo   SilkWay Travel Uzbekistan - Global Online Platform
echo =========================================================
echo.
echo 1. Server ishga tushmoqda...
cd /d "%~dp0"
start "SilkWay Node Server" cmd /k "node server.js"

echo 2. Cloudflare Global Tunnel ishga tushirilmoqda...
echo (Quyida chiqadigan https://....trycloudflare.com havolasini do'stingizga yuboring)
echo.
"%~dp0cloudflared.exe" tunnel --protocol http2 --url http://localhost:3000
pause
