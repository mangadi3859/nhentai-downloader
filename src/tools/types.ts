export interface INhentaiGalleryResult {
    id: number;
    media_id: string;
    title: INhentaiTitle;
    images: INhentaiImages;
    scanlator: string;
    upload_date: number;
    tags: INhentaiTag[];
    num_pages: number;
    num_favorites: number;
}

interface INhentaiTitle {
    english: string;
    japanese: string;
    pretty: string;
}

interface INhentaiImages {
    pages: INhentaiImagePage[];
    cover: INhentaiImage;
    thumbnail: INhentaiImage;
}

interface INhentaiImage {
    t: "j" | "p" | "g";
    w: number;
    h: number;
}

interface INhentaiImagePage extends INhentaiImage {}

interface INhentaiTag {
    id: number;
    type: string;
    name: string;
    url: string;
    count: number;
}

export type ArrayType<T> = T extends (infer V)[] ? V : never;
