# Trusted Local File Links for Obsidian

Open trusted local files from Obsidian in their default Windows apps without the “Open file in another app?” prompt. Works with Markdown links in note Reading view and Canvas text cards. For example, open a PDF in your PDF viewer, a PSD in your image editor, or a WAV in your audio app.

## Install and use

1. On Windows, download [main.js](main.js) and [manifest.json](manifest.json) using **Download raw file** on each file page.
2. Put both files in your vault's `.obsidian/plugins/trusted-local-file-links/` folder. Use your vault's configuration folder if it differs from `.obsidian`.
3. Restart Obsidian desktop on Windows. In **Settings → Community plugins**, enable **Trusted Local File Links**.
4. Open **Settings → Trusted Local File Links**. Set **Trusted folder** to an absolute local path, such as `C:/Projects/Reference`. Set **File extensions** to the comma-separated formats you want to open, such as `pdf, png, wav, psd`.
5. Add a Markdown link to a file in that folder, open the note in Reading view or view the Canvas card, and click the link.

```markdown
[Reference PDF](file:///C:/Projects/Reference/Shot%20List.pdf)
```

Use forward slashes and encode spaces as `%20`. The plugin uses the default app associated with each file type in Windows. Only supported document, image, audio, and video types within the configured folder are eligible. The plugin checks where the file resolves on disk before opening it. Other links use Obsidian's normal behavior. Clear **Trusted folder** to turn off direct opening.

## 日本語での導入

1. `main.js` と `manifest.json` を保管庫の `.obsidian/plugins/trusted-local-file-links/` に置きます。
2. Windows版Obsidianを再起動し、**設定 → コミュニティプラグイン**で **Trusted Local File Links** を有効にします。
3. プラグイン設定の **Trusted folder** に信頼するフォルダーの絶対パスを、**File extensions** に開きたい拡張子（例 `pdf, png, wav, psd`）を入力します。
4. 上の例のように `file:///` リンクを作り、ノートの閲覧モードかCanvasのテキストカードでクリックします。対象ファイルは確認ダイアログなしで、Windowsで関連付けられたアプリで開きます。

An [optional VLC feature](examples/README.md) opens a video at a specified time from a Canvas card. / オプションで、Canvasから動画を指定時刻にVLCで開けます。
