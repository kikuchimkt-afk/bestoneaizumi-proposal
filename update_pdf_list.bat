@echo off
powershell -NoProfile -ExecutionPolicy Unrestricted -File "%~dp0generate_pdf_list.ps1"
echo.
echo PDF list updated. Press any key to exit...
pause >nul
