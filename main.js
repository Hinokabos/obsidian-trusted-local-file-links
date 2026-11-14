const { Plugin, PluginSettingTab, Setting, Notice, normalizePath } = require("obsidian");
const { spawn } = require("node:child_process");
const { shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { fileURLToPath } = require("node:url");

const defaults = {
    trustedFolder: "",
    extensions: "pdf, png, jpg, jpeg, webp, wav, mp3, mp4, mov, psd",
    canvas: "",
    mediaFolder: "",
    vlcPath: "C:/Program Files/VideoLAN/VLC/vlc.exe",
};

const supportedExtensions = new Set([
    "pdf", "png", "jpg", "jpeg", "webp", "gif", "bmp", "tif", "tiff", "psd",
    "wav", "mp3", "flac", "ogg", "m4a", "aac", "mp4", "mov", "mkv", "webm",
    "txt", "md",
]);

class LocalFileLinkSettings extends PluginSettingTab {
    constructor(plugin) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    display() {
        this.containerEl.empty();
        const fields = [
            ["trustedFolder", "Trusted folder", "Absolute path to a local folder whose files you trust. Leave blank to disable direct opening."],
            ["extensions", "File extensions", "Comma-separated extensions. Supported: " + [...supportedExtensions].join(", ") + "."],
            ["canvas", "Canvas path", "Path relative to the vault, e.g. Boards/Editing.canvas."],
            ["mediaFolder", "Video folder", "Absolute path to the folder containing your MP4 files."],
            ["vlcPath", "VLC executable", "Absolute path to vlc.exe."],
        ];
        for (const [key, name, description] of fields) {
            if (key === "canvas") new Setting(this.containerEl).setName("Optional VLC timestamp playback").setHeading();
            new Setting(this.containerEl).setName(name).setDesc(description).addText(input =>
                input.setValue(this.plugin.settings[key]).onChange(async value => {
                    value = value.trim();
                    this.plugin.settings[key] = key === "canvas" && value ? normalizePath(value) : value;
                    await this.plugin.saveData(this.plugin.settings);
                }));
        }
    }
}

function pathFromFileUrl(value) {
    const url = new URL(value);
    if (url.protocol !== "file:" || url.host || url.search || url.hash) {
        throw new Error("Use an absolute local file URL.");
    }
    return fileURLToPath(url);
}

function inside(dir, file) {
    const relative = path.relative(dir, file);
    return relative !== "" && relative !== ".." &&
        !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
}

function isLocalPath(file) {
    return /^[a-z]:[\\/]/i.test(file) && !file.slice(2).includes(":");
}

function extensionOf(file) {
    return path.extname(file).slice(1).toLowerCase();
}

function trustedFile(file, folder, extensions) {
    if (!isLocalPath(file) || !isLocalPath(folder) || !inside(folder, file)) return;
    const allowed = new Set(extensions.toLowerCase().split(/[\s,.]+/));
    const extension = extensionOf(file);
    if (!supportedExtensions.has(extension) || !allowed.has(extension)) return;
    const root = fs.realpathSync(folder);
    const resolved = fs.realpathSync(file);
    if (isLocalPath(root) && isLocalPath(resolved) && inside(root, resolved) &&
        extensionOf(resolved) === extension && fs.statSync(resolved).isFile()) return resolved;
}

function handleClick(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
}

function readCue(playlist, Parser, footage) {
    const xml = new Parser().parseFromString(fs.readFileSync(playlist, "utf8"), "application/xml");
    const tracks = xml.getElementsByTagNameNS("http://xspf.org/ns/0/", "track");
    if (tracks.length !== 1) throw new Error("The playlist must contain exactly one track.");
    const locations = tracks[0].getElementsByTagNameNS("http://xspf.org/ns/0/", "location");
    const options = Array.from(tracks[0].getElementsByTagNameNS("http://www.videolan.org/vlc/playlist/ns/0/", "option"));
    const starts = options.map(node => /^start-time=(\d+(?:\.\d+)?)$/.exec(node.textContent.trim())).filter(Boolean);
    if (locations.length !== 1 || starts.length !== 1 || !Number.isFinite(Number(starts[0][1]))) {
        throw new Error("The playlist must contain one video location and one valid start-time.");
    }
    const video = fs.realpathSync(pathFromFileUrl(locations[0].textContent.trim()));
    if (!inside(fs.realpathSync(footage), video) || !/\.mp4$/i.test(video) || !fs.statSync(video).isFile()) {
        throw new Error("Choose an MP4 inside the configured video folder.");
    }
    return [video, starts[0][1]];
}

module.exports = class TrustedLocalFileLinks extends Plugin {
    async onload() {
        this.settings = { ...defaults, ...await this.loadData() };
        if (process.platform !== "win32") return;
        this.addSettingTab(new LocalFileLinkSettings(this));
        this.registerDomEvent(document, "click", event => this.openLink(event), { capture: true });
    }

    async openLink(event) {
        if (event.button !== 0 || event.defaultPrevented || !event.isTrusted ||
            event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

        const link = event.target?.closest?.("a[href]");
        const view = this.app.workspace.getMostRecentLeaf()?.view;
        if (!link || !view?.containerEl.contains(link)) return;
        const inCanvas = view.getViewType() === "canvas" && link.closest(".canvas-node-content");
        const inNote = view.getViewType() === "markdown" && link.closest(".markdown-preview-view");
        if (!inCanvas && !inNote) return;

        const href = link.getAttribute("href");
        if (!/^file:\/\/\//i.test(href)) return;
        let candidate;
        try {
            candidate = pathFromFileUrl(href);
        } catch {
            return;
        }

        if (inCanvas && /\.xspf$/i.test(candidate) && /VLC/i.test(link.textContent)) {
            this.playFromCanvas(event, candidate, link.ownerDocument.defaultView.DOMParser);
            return;
        }

        let file;
        try {
            file = trustedFile(candidate, this.settings.trustedFolder, this.settings.extensions);
        } catch {
            // Let Obsidian handle missing or inaccessible paths as it normally would.
            return;
        }
        if (!file) return;

        handleClick(event);
        try {
            const error = await shell.openPath(file);
            if (error) new Notice("Could not open the file. " + error);
        } catch (error) {
            new Notice("Could not open the file. " + error.message);
        }
    }

    playFromCanvas(event, candidate, Parser) {
        const { canvas, mediaFolder, vlcPath } = this.settings;
        if (!canvas || !path.isAbsolute(mediaFolder) || !path.isAbsolute(vlcPath) ||
            this.app.workspace.getActiveFile()?.path !== canvas) return;
        try {
            const vaultPlaylists = path.join(this.app.vault.adapter.getBasePath(), "vlc");
            if (!inside(vaultPlaylists, candidate)) return;
            const dir = fs.realpathSync(vaultPlaylists);
            const playlist = fs.realpathSync(candidate);
            if (!inside(dir, playlist) || !/\.xspf$/i.test(playlist) ||
                !fs.statSync(playlist).isFile()) return;
            const [video, second] = readCue(playlist, Parser, mediaFolder);
            handleClick(event);
            const player = spawn(vlcPath, ["--no-qt-start-minimized", "--start-time=" + second, "--", video],
                { detached: true, stdio: "ignore" });
            player.on("error", error => new Notice("Could not start VLC. " + error.message));
            player.unref();
        } catch (error) {
            handleClick(event);
            new Notice("Could not play the VLC link. " + error.message);
        }
    }
};
