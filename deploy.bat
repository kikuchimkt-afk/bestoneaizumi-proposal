@echo off
chcp 65001
echo -------------------------------------------------------
echo  GitHubへアップロード (Vercelへデプロイ)
echo -------------------------------------------------------
echo.

REM Gitがインストールされているか確認
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Gitがインストールされていません。
    echo https://git-scm.com/ からGitをインストールしてください。
    pause
    exit /b
)

echo 上書き保存中...
git add .

echo.
set /p commit_msg="変更内容のメモを入力してください (エンターで省略): "
if "%commit_msg%"=="" set commit_msg="Update content"

git commit -m "%commit_msg%"

echo.
echo GitHubへプッシュしています...
git push

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] アップロード完了！
    echo Vercelが自動的に検知して更新を開始します（約1分で反映）。
) else (
    echo.
    echo [ERROR] アップロードに失敗しました。
    echo ※初めての場合は、まず手動でリポジトリとの紐付け(git remote add)が必要です。
)

pause
