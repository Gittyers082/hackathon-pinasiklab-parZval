@echo off
setlocal
cd /d "%~dp0"
set "KITA_TUNNEL="
if exist "%~dp0cloudflared.exe" set "KITA_TUNNEL=%~dp0cloudflared.exe"
for /f "delims=" %%P in ('where cloudflared 2^>nul') do if not defined KITA_TUNNEL set "KITA_TUNNEL=%%P"
if not defined KITA_TUNNEL (
  echo Install Cloudflare Tunnel first. In PowerShell run:
  echo winget install --id Cloudflare.cloudflared --exact
  echo Then reopen this file. Or place cloudflared.exe beside this file.
  pause
  exit /b 1
)
echo Open the HTTPS trycloudflare.com address below on your phone.
echo Keep this window and START_PHONE_SERVER open while using database features.
"%KITA_TUNNEL%" tunnel --url http://127.0.0.1:8080
pause
