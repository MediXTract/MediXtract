@echo off
setlocal

:: Settings
set "PORT=2602"
set "WEB_DIR=c:\MediXtract\___WEB"
set "ICON_PATH=%WEB_DIR%\images\logos\flav-icon-MediXtract-Circular.ico"
set "SHORTCUT_NAME=MediXtract WEB.lnk"
set "SHORTCUT_PATH=%WEB_DIR%\%SHORTCUT_NAME%"

echo Initializing local access for MediXtract...

:: Create the shortcut in the current folder using a single-line command
powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = 'powershell.exe'; $Shortcut.Arguments = '-WindowStyle Hidden -Command \"Start-Process ''http://localhost:%PORT%''; npx serve -p %PORT% ''%WEB_DIR%''\"'; $Shortcut.IconLocation = '%ICON_PATH%'; $Shortcut.WorkingDirectory = '%WEB_DIR%'; $Shortcut.Description = 'Open MediXtract Localhost'; $Shortcut.Save()"

echo.
echo ========================================================
echo  SUCCESS: Shortcut created!
echo  Location: %SHORTCUT_PATH%
echo  Access: http://localhost:%PORT%
echo ========================================================
echo.
pause
