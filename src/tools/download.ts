import { jsPDF } from "jspdf";
import { INhentaiGalleryResult, ArrayType } from "./types";

export default async function downloadGallery(cors: string, cb: (progress: number, max: number, status: boolean) => any): Promise<void> {
    const regexID = new RegExp(/(?<=^(https?:\/\/|www\.)?nhentai\.net\/g\/)(\d+)(?=\/$)?/, "i");
    const code = window.location.href.match(regexID);

    if (!code) throw new Error("Gallery ID not found");

    let gallery: INhentaiGalleryResult = await (await fetch(`https://nhentai.net/api/gallery/${code[0]}`)).json();
    let doc = new jsPDF({
        unit: "px",
        format: [gallery.images.pages[0].w, gallery.images.pages[0].h],
        hotfixes: ["px_scaling"],
    });

    for (let i = 1; i < gallery.images.pages.length; i++) {
        doc.addPage([gallery.images.pages[i].w, gallery.images.pages[i].h], "p");
    }

    let completion = 0;
    let images = await queue<ArrayType<INhentaiGalleryResult["images"]["pages"]>>(gallery.images.pages, async (image, i) => {
        let img: ArrayBuffer = await (
            await fetch(`${cors}https://i3.nhentai.net/galleries/${gallery.media_id}/${i + 1}.${image.t == "j" ? "jpg" : "png"}`, {
                headers: {
                    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;",
                },
            })
        ).arrayBuffer();

        doc.setPage(i + 1);
        if (i != 0) {
            doc.addImage(new Uint8Array(img), "jpeg", 0, 0, Math.floor(image.w), Math.floor(image.h), i.toString());
        } else doc.addImage(new Uint8Array(img), "jpeg", 0, 0, Math.floor(image.w), Math.floor(image.h), i.toString());
        completion++;
        cb(completion, gallery.images.pages.length, tryToSave(completion, gallery, doc));
    });
}

function tryToSave(completion: number, gallery: INhentaiGalleryResult, doc: jsPDF): boolean {
    if (completion < gallery.images.pages.length) return false;
    let outpdf = doc.output("blob");
    let a = document.createElement("a");
    a.download = `[NHENTAI] ${gallery.title.english} - ${gallery.id}.pdf`;
    a.href = URL.createObjectURL(outpdf);
    a.dataset.downloadurl = ["file/pdf", a.download, a.href].join(":");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    return true;
}

async function queue<T>(arr: Array<T>, callback: (element: T, index: number) => any, chunk: number = 20): Promise<Array<T>> {
    let queues: T[][] = [];
    let res: T[] = [];
    for (let i = 0; i < arr.length; i += chunk) {
        queues.push(arr.slice(i, Math.min(i + chunk, arr.length)));
    }

    for (let index = 0; index < queues.length; index++) {
        res = res.concat(await Promise.all(queues[index].map((e, i) => callback(e, i + chunk * index))));
    }

    return res;
}
