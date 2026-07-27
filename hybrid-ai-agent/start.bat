@echo off
echo ============================================
echo   Lmina AI - Starting All Services
echo ============================================
echo.

REM Kill old processes
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2

REM Start MongoDB
echo [1/3] Starting MongoDB...
start /min "" "C:\Users\arooj\Desktop\Lmina myai\mongoserver\mongodb-win32-x86_64-windows-6.0.14\bin\mongod.exe" --dbpath "C:\Users\arooj\Desktop\Lmina myai\mongodata"
timeout /t 3
echo MongoDB started on port 27017

REM Start Server
echo [2/3] Starting API Server...
cd /d "C:\Users\arooj\Desktop\Lmina myai\hybrid-ai-agent\server"
start /min "" node src/index.js
timeout /t 5
echo Server started on port 5000

echo [3/3] All services running!
echo.
echo ============================================
echo   Open in browser: http://localhost:5000
echo   Login: admin@lmina.ai / admin123
echo ============================================
echo.
pause
