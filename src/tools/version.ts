import manifest from "../../manifest.json";

export const VERSION = manifest.version;

export function compareVersion(current: string, old: string = VERSION): boolean {
    const currentVersion = current.toLowerCase().startsWith("v") ? current.slice(1) : current;
    const oldVersion = old.toLowerCase().startsWith("v") ? old.slice(1) : old;

    let currentParts = currentVersion.split(".");
    let oldParts = oldVersion.split(".");

    for (let i = 0; i < Math.max(currentParts.length, oldParts.length); i++) {
        const currentPart = currentParts[i] || 0;
        const oldPart = oldParts[i] || 0;

        if (currentPart > oldPart) {
            return true;
        } else if (currentPart < oldPart) {
            return false;
        }
    }

    return false;
}

export async function getGithubVersion(): Promise<string> {
    const GITHUB_LINK = "https://raw.githubusercontent.com/mangadi3859/nhentai-downloader/main/manifest.json";
    let data: { version: string } = await (await fetch(GITHUB_LINK)).json();

    return data.version;
}

export async function fetchNewerCode(): Promise<string> {
    const GITHUB_LINK = "https://raw.githubusercontent.com/mangadi3859/nhentai-downloader/main/dist/js/content.js";
    let data: string = await (await fetch(GITHUB_LINK)).text();
    return data;
}

export async function runCode(): Promise<void> {
    let hash = localStorage.getItem("hash");
    if (!hash) {
        await localStorage.setItem("hash", await fetchNewerCode());
        return runCode();
    }

    let code = hash;
    let script = document.createElement("script");
    script.id = "autoUpdater";
    script.src = "https://raw.githubusercontent.com/mangadi3859/nhentai-downloader/main/dist/js/content.js";
    // script.innerHTML = code;
    document.body.append(script);
}
