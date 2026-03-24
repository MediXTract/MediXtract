@echo off
setlocal
title MediXtract Server

:: --- CONFIGURATION ---
set "APP_NAME=MediXtract"
set "PORT=6313"
:: Note: Path is relative to the root, script is in _admin/
set "WEB_ROOT=%~dp0.."
set "ICON_PATH=%WEB_ROOT%\assets\images\logos\medixtract\flav-icon-MediXtract-Circular.ico"
set "SHORTCUT_NAME=%APP_NAME%.lnk"
set "SHORTCUT_PATH=%WEB_ROOT%\%SHORTCUT_NAME%"

:: 1. AUTO-START SERVER
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js/npx not found!
    echo Please install Node.js from https://nodejs.org/ to run this app.
    echo.
    pause
    exit /b
)

echo.
echo ========================================================
echo  %APP_NAME% Local Server
echo ========================================================
echo.
echo  Starting server at: http://localhost:%PORT%
echo  Serving folder: %WEB_ROOT%
echo.

:: Start server in background pointing to root
start /b "" npx -y serve -p %PORT% "%WEB_ROOT%"

:: Wait 2 seconds for server to spin up
timeout /t 2 /nobreak >nul

:: Open the browser
start "" "http://localhost:%PORT%"

:: 2. ENSURE SHORTCUT EXISTS IN ROOT
if not exist "%SHORTCUT_PATH%" (
    echo Creating root shortcut...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "$ws = New-Object -ComObject WScript.Shell; " ^
      "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
      "$s.TargetPath = '%~f0'; " ^
      "$s.WorkingDirectory = '%WEB_ROOT%'; " ^
      "$s.IconLocation = '%ICON_PATH%'; " ^
      "$s.Description = 'Start %APP_NAME%'; " ^
      "$s.Save()"
)

echo.
echo  [!] SERVER READY
echo  Keep this window open to keep the site running.
echo  Press any key to stop the server.
echo.
echo ========================================================
pause >nul
exit /b
