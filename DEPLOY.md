# GitHub & Vercel デプロイガイド

このアプリケーションは構成がシンプル（静的HTML/JS）なため、GitHub経由でVercelに公開するのに非常に適しています。
以下の手順に従って運用を開始してください。

## 1. 初回デプロイ手順

1. **GitHubにリポジトリを作成**
   - GitHubで新しいリポジトリ（例: `ecc-proposal-tool`）を作成します。
   - `Public`（公開）または `Private`（非公開）を選択します（業務利用であればPrivate推奨）。

2. **ファイルをプッシュ**
   - このフォルダの内容をGitHubにプッシュしてください。
   - 必須ファイル: `index.html`, `script_new.js`, `style.css`, `pdf_list.js`, `pdf/フォルダ`

3. **Vercelでプロジェクトを作成**
   - Vercelのダッシュボードで "Add New..." -> "Project" を選択します。
   - GitHubリポジトリをインポートします。
   - **Build Settings**: 何も設定する必要はありません（Framework Preset: Other / None）。
   - **Deploy** をクリックします。

## 2. PDF資料の追加・更新方法（重要）

**注意**: サーバー上（Vercel上）では `.bat` ファイルは実行できません。PDFを追加する際は、必ず**ローカル（自分のPC）**で以下の作業を行ってください。

1. **PDFファイルを配置**
   - 自分のPCで、`pdf` フォルダに新しいPDFファイルを入れます。

2. **リスト更新スクリプトを実行**
   - `update_pdf_list.bat` をダブルクリックします。
   - これにより、`pdf_list.js` ファイルが自動的に更新され、新しいファイル名が書き込まれます。

3. **変更をGitHubにプッシュ**
   - 更新された `pdf` フォルダの中身と、書き換わった `pdf_list.js` をGitHubにコミット＆プッシュします。
   - 例（コマンドラインの場合）:
     ```bash
     git add pdf/新しいファイル.pdf pdf_list.js
     git commit -m "PDF資料を追加"
     git push origin main
     ```

4. **自動デプロイ**
   - GitHubへのプッシュを検知して、Vercelが自動的に新しいバージョンを公開します（数分かかります）。

## 3. ロゴ画像の追加・更新

「ロゴ」フォルダ内の画像もサーバーから参照できます。

1. **画像の配置**: `ロゴ` フォルダに画像（.jpg, .png等）を入れます。
2. **リスト更新**:
   - `update_logo_list.bat` を実行します（PowerShellスクリプトが動作します）。
   - うまくいかない場合（文字化け等）は、`logo_list.js` を直接テキストエディタで開き、以下のようにファイル名を追記してください。
     ```javascript
     const LOGO_FILES = ['file1.jpg', 'file2.png'];
     ```
3. **GitHubへプッシュ**: `ロゴ` フォルダと `logo_list.js` をプッシュします。

## 4. APIキーの扱いについて

- Gemini APIキーはユーザーのブラウザ（ローカルストレージ）に保存されます。
- サーバー側（Vercel）やGitHubのコード内にAPIキーを含める必要はありません。安全です。
- 利用者は、Webページを開いた後に自分のAPIキーを入力して利用開始します。
