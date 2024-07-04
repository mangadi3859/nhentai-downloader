export const VERSION = "v1.1.5";

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

// TODO: get github data version
export function getGithubVersion(): string {
    return "";
}
