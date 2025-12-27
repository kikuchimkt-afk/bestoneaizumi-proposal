@echo off
echo Starting Proposal Tool...
echo.
echo -------------------------------------------------------
echo  ECC BestOne Proposal Tool - Local Server
echo -------------------------------------------------------
echo.
echo Opening browser...
start http://localhost:8000

echo Starting local web server...
echo (Close this window to stop the tool)
echo.

REM Check for Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    python -m http.server 8000
    pause
    exit
)

REM Check for Python (py launcher)
py --version >nul 2>&1
if %errorlevel% equ 0 (
    py -m http.server 8000
    pause
    exit
)

REM Check for NPX (Node.js) - fallback
call npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python not found, trying npx serve...
    call npx -y serve .
    pause
    exit
)

echo.
echo [ERROR] Python was not found on your computer.
echo.
echo To fix this, please install Python from the Microsoft Store or python.org.
echo Or, if you want to deploy to Vercel immediately, skip this step.
echo.
pause
