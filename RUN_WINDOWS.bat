@echo off
chcp 65001 >nul
echo ============================================
echo   🎮 Game Bundle Setup - Windows Version
echo ============================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found!
    echo Please install from: https://nodejs.org
    start https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found:
node --version
echo.

:: Check if node_modules exists
if exist "node_modules" (
    echo ✅ Dependencies already installed!
    goto :run
) else (
    echo 📦 Installing dependencies...
    echo.
    
    :: Try npm install first
    echo Attempt 1: npm install...
    call npm install --fetch-timeout=180000
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Installation successful!
        goto :run
    )
    
    :: If npm fails, try clearing cache
    echo.
    echo ⚠️ npm failed, trying with clean cache...
    call npm cache clean --force
    call npm install --prefer-offline
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Installation successful!
        goto :run
    )
    
    :: If still fails, suggest yarn
    echo.
    echo ⚠️ Still failing. Trying yarn...
    where yarn >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        call yarn install
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ✅ Installation successful with yarn!
            goto :run
        )
    )
    
    :: Final suggestion
    echo.
    echo ❌ All installation methods failed!
    echo.
    echo POSSIBLE SOLUTIONS:
    echo   1. Check your internet connection
    echo   2. Try using a VPN
    echo   3. Run this script as Administrator
    echo   4. Install yarn: npm install -g yarn
    echo   5. Try again later (npm servers might be down)
    echo.
    pause
    exit /b 1
)

:run
echo.
echo ============================================
echo   🚀 Starting Game Server...
echo ============================================
echo.
echo The game will open at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm run dev
pause
