@echo off
REM Copies the app from public\ into docs\ for GitHub Pages (demo mode).
REM PHP (public\api) and .htaccess are skipped: GitHub Pages cannot run PHP.
REM Run from anywhere:  scripts\publish-docs.bat   then commit and push docs\.
cd /d "%~dp0.."
robocopy public docs /E /XD api /XF .htaccess /NFL /NDL /NJH /NJS
if %ERRORLEVEL% GEQ 8 (echo Copy FAILED & exit /b 1)
type nul > docs\.nojekyll
echo Done. Now commit and push the docs folder.
