@echo off
setlocal
cd /d "%~dp0"
if exist ".env" (
  echo Existing .env found. Leaving it unchanged.
) else (
  if not exist ".env.example" (
    echo .env.example is missing. Run this from the project folder.
    pause
    exit /b 1
  )
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example.
)
echo.
echo Confirm the settings in .env match YOUR local WAMP MySQL.
echo In phpMyAdmin, import database\schema.sql if the tables are not created.
echo WARNING: database\seed.sql erases existing rows and inserts sample data.
echo Test: http://kitaklaro.localhost/api/entries.php?today=1
echo.
pause
