@echo off
setlocal
cd /d "%~dp0"
set "KITA_PHP="
for /f "delims=" %%P in ('where php 2^>nul') do if not defined KITA_PHP set "KITA_PHP=%%P"
if not defined KITA_PHP for /d %%D in ("C:\wamp64\bin\php\php*" "C:\wamp\bin\php\php*" "D:\wamp64\bin\php\php*" "D:\wamp\bin\php\php*") do if exist "%%~D\php.exe" set "KITA_PHP=%%~D\php.exe"
if not defined KITA_PHP (
  echo PHP was not found. Drag your WAMP php.exe into this window and press Enter.
  set /p "KITA_PHP=PHP path: "
)
set KITA_PHP=%KITA_PHP:"=%
if not exist "%KITA_PHP%" (
  echo PHP path does not exist.
  pause
  exit /b 1
)
echo Keep WAMP running for MySQL.
echo Open http://127.0.0.1:8080 on this laptop to check the app.
echo Keep this window open, then run START_PHONE_LINK.bat.
"%KITA_PHP%" -S 127.0.0.1:8080 -t "%~dp0public"
pause
