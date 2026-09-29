@echo off
cd /d "%~dp0"
echo Building Velvet Loop Studio installer (one-time setup)...
call npm install || goto :fail
call npm run dist || goto :fail
echo.
echo Done. Running installer from the dist folder...
for %%f in (dist\Velvet-Loop-Studio-Setup-*.exe) do start "" "%%f"
exit /b 0
:fail
echo Build failed.
pause
