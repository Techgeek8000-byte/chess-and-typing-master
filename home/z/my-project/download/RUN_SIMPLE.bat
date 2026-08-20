@echo off
chcp 437 >nul
echo ============================================
echo   Game Bundle Setup - Windows
echo ============================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install from: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

if exist "node_modules" (
    echo [OK] Dependencies already installed!
    goto run
)

echo [STEP] Installing dependencies...
echo This may take 5-10 minutes...
echo.

call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Installation complete!
    goto run
)

echo.
echo [WARN] npm failed. Trying with cache clean...
call npm cache clean --force
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Installation complete!
    goto run
)

echo.
echo [ERROR] Installation failed!
echo.
echo SOLUTIONS:
echo   1. Check your internet connection
echo   2. Try using a VPN
echo   3. Run this script as Administrator
echo   4. Or try these commands manually:
echo      npm cache clean --force
echo      npm install
echo      npm run dev
echo.
pause
exit /b 1

:run
echo.
echo ============================================
echo   Starting Game Server...
echo ============================================
echo.
echo Open: http://localhost:3000
echo Press Ctrl+C to stop
echo.
call npm run dev
pause
