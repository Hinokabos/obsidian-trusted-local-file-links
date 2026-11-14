# VLC Timestamp Links for Obsidian

Open a local MP4 in VLC from an Obsidian Canvas card at the time specified in an XSPF playlist. For matching links, the plugin opens the video directly in VLC.

## Requirements

- Windows desktop with Obsidian 1.8.0 or later and VLC media player installed.
- An Obsidian Canvas with text cards and local MP4 files.

## Manual installation

1. Download `main.js` and `manifest.json` from this repository using the **Raw** or **Download raw file** button on each file page.
2. In your vault, create `.obsidian/plugins/vlc-timestamp-links/` and put both files in that folder. If your vault uses a custom configuration folder, use it in place of `.obsidian`.
3. Restart Obsidian. Open **Settings → Community plugins** and enable **VLC Timestamp Links**. Manual plugins require community plugins to be enabled.
4. Open **Settings → VLC Timestamp Links**. Enter the Canvas path relative to the vault (e.g. `Boards/Editing.canvas`), your video folder (e.g. `C:/Videos`), and the full path to `vlc.exe` if it differs from the default.

## Try a link

1. Create a folder named `vlc` at the root of your vault and place [clip.xspf](examples/clip.xspf) in it.
2. Edit the XSPF `location` to the absolute `file:///` URL of an MP4 in your configured video folder. Set `start-time` in seconds. The example starts at 00:45, so choose a video longer than 45 seconds or set a smaller value.
3. Paste the Markdown below into a text card on the configured Canvas. Replace `My%20Vault` and the parent path with your vault's actual full path. Use forward slashes and URL-encode spaces as `%20`. Click **Play in VLC** while viewing the card.

```markdown
[Play in VLC](file:///C:/My%20Vault/vlc/clip.xspf)
```

The link text must contain `VLC`. Playlists must contain one track, one local MP4 location, and one start time. The plugin resolves both paths on disk and checks that the playlist is under the vault's `vlc` folder and the MP4 is under the configured video folder. It passes the video path and start time to VLC. Other XSPF options are ignored.

## 日本語での導入

1. WindowsにVLCをインストールし、このリポジトリの `main.js` と `manifest.json` を保管庫の `.obsidian/plugins/vlc-timestamp-links/` に置きます。
2. Obsidianを再起動し、**設定 → コミュニティプラグイン**で **VLC Timestamp Links** を有効にします。
3. プラグイン設定に、対象Canvasの保管庫からの相対パス（例 `Boards/Editing.canvas`）、MP4を置いているフォルダーの絶対パス、VLCの実行ファイルの絶対パスを入力します。
4. 保管庫直下の `vlc` フォルダーに [clip.xspf](examples/clip.xspf) を置き、動画のURLと開始秒数を変更します。上のMarkdown例をCanvasのテキストカードに貼り付け、XSPFのパスを自分の保管庫に合わせます。リンクの表示名は「VLCで開く」など、`VLC` を含む名前にしてください。

解除するには、**設定 → コミュニティプラグイン**で **VLC Timestamp Links** を無効にします。
