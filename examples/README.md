# VLC timestamp playback

This optional feature requires VLC on Windows.

1. In the plugin settings, under **Optional VLC timestamp playback**, enter the **Canvas path** relative to your vault, the absolute **Video folder** path, and the full path to `vlc.exe` under **VLC executable**.
2. Save [clip.xspf](clip.xspf) in the `vlc` folder at the root of your vault. Edit the MP4 file URL and the start time in seconds.
3. Add a link to the XSPF in a text card on the configured Canvas. Use the full file URL and include `VLC` in the link label.

```markdown
[Play in VLC](file:///C:/My%20Vault/vlc/clip.xspf)
```
