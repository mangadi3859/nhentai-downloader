import downloadGallery from "./tools/download";

const DOWNLOAD_STRING = "Download PDF";
const CORS_KEY = "jc-url";

const info = <HTMLDivElement>document.querySelector("#info");
const buttonContainer = document.createElement("div");
const justcorsWarning = document.createElement("div");

let downloadBtn = document.createElement("button");
let span = document.createElement("span");
let icon = document.createElement("i");

if (info) nhentaiDownloader();

async function nhentaiDownloader() {
    buttonContainer.dataset["buttonContainer"] = "";
    buttonContainer.classList.add("buttons");
    buttonContainer.style.margin = "0";
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexDirection = "column";
    buttonContainer.style.gap = ".5rem";

    justcorsWarning.innerHTML = `<div data-cors-error>Invalid justcors url |</div> <a target="_blank" style="cursor: pointer; color: #ed2553;" href="https://justcors.com">Get JustCors URL</a> | <a style="cursor: pointer; color: #ed2553" data-set-cors>Change JustCors</a>`;
    justcorsWarning.style.display = "flex";
    justcorsWarning.style.flexWrap = "wrap";
    justcorsWarning.style.gap = ".5rem";

    downloadBtn.classList.add("btn", "btn-primary");
    downloadBtn.style.marginRight = "auto";
    icon.classList.add("fa", "fa-download");
    span.style.marginLeft = ".5rem";
    span.innerText = DOWNLOAD_STRING;

    await checkJustcors();
    downloadBtn.append(icon, span);
    buttonContainer.append(downloadBtn);
    buttonContainer.append(justcorsWarning);
    info.append(buttonContainer);
    buttonContainer.querySelector("[data-set-cors]")?.addEventListener("click", setJustcors);

    downloadBtn.addEventListener("click", async (e) => {
        if (!(await checkJustcors())) return;
        downloadBtn.style.cursor = "not-allowed";
        (<HTMLSpanElement>downloadBtn.querySelector("span")).innerText = `Downloading... (?/?)`;

        downloadGallery((await chrome.storage.local.get([CORS_KEY]))[CORS_KEY], (progress, max, status) => {
            downloadBtn.disabled = !status;
            if (!status) {
                downloadBtn.style.cursor = "not-allowed";
                (<HTMLSpanElement>downloadBtn.querySelector("span")).innerText = `Downloading... (${progress}/${max})`;
            } else {
                downloadBtn.style.cursor = "pointer";
                (<HTMLSpanElement>downloadBtn.querySelector("span")).innerText = DOWNLOAD_STRING;
            }
        });
    });
}

async function setJustcors(): Promise<void> {
    let value = window.prompt("Enter justcors URL");
    if (!value) return;

    await chrome.storage.local.set({ [CORS_KEY]: value });
    checkJustcors();
}

async function checkJustcors(): Promise<boolean> {
    let cors = (await chrome.storage.local.get([CORS_KEY]))[CORS_KEY];
    let warning = <HTMLDivElement | null>justcorsWarning.querySelector("[data-cors-error]");
    if (!warning) return false;

    try {
        (await fetch(cors)).status;
    } catch (err) {
        console.log("Please enter a valid JustCors url and run the script again");
        console.log("https://justcors.com");

        downloadBtn.disabled = true;
        downloadBtn.style.cursor = "not-allowed";

        warning.style.display = "block";
        return false;
    }

    let regex = /^(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])$/gi;
    if (!regex.test(cors) || new URL(cors).hostname != "justcors.com") {
        console.log("Please enter a valid JustCors url and run the script again");
        console.log("https://justcors.com");

        downloadBtn.disabled = true;
        downloadBtn.style.cursor = "not-allowed";
        warning.style.display = "block";
        return false;
    }

    downloadBtn.disabled = false;
    downloadBtn.style.cursor = "pointer";
    warning.style.display = "none";
    return true;
}
