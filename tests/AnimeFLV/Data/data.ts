export class Data {
    private readonly caps_today: Capitulo[] = [];
    private readonly animes: string[][] = [];
    private readonly provider: string;
    private readonly webhookUrl: string;
    private readonly page: string;

    constructor(public name: string, page: string, provider: string, webhookUrl: string) {
        this.provider = provider;
        this.webhookUrl = webhookUrl;
        this.page = page;
    }

    public get getProvider() {
        return this.provider;
    }

    public get getWebhookUrl() {
        return this.webhookUrl;
    }

    public get getPage() {
        return this.page;
    }

    public async addCap(cap: Capitulo) {
        this.caps_today.push(cap);
    }

    async getCapByTitle(title: string): Promise<Capitulo | null> {
        for (const cap of this.caps_today) {
            if (cap.getTitle === title) {
                return cap;
            }
        }
        return null;
    }

    public getCapitulos() {
        return this.caps_today;
    }

    public validateNameOfAnimeToSendDiscord(name: string): boolean {
        return this.animes.some(anime => {
            return anime.every(word => name.toLowerCase().includes(word.toLowerCase()));
        });
    }

    public setAnimes(name: string[]): void {
        this.animes.push(name);
    }
}


export class Capitulo {
    private url: string;
    private title: string;
    private view_url: string[] = [];
    private image: string = "";

    constructor(url: string, title: string, image?: string) {
        this.url = url;
        this.title = title;
        this.image = image ?? "https://www3.animeflv.net/assets/animeflv/img/logo.png?v=2.3";
    }

    public async addViewUrl(url: string) {
        this.view_url.push(url);
    }

    public get getUrl() {
        return this.url;
    }

    public get getTitle() {
        return this.title;
    }

    public get viewUrls() {
        return this.view_url;
    }

    public get getImage() {
        return this.image;
    }
}

export class AnimeTarget {
    name: string[];
    link: string;
    found: boolean;
    image: string;
    fullname: string;
    caps: Capitulo[];

    constructor(names: string[]) {
        this.name = names;
        this.link = "";
        this.found = false;
        this.image = "";
        this.fullname = "";
        this.caps = [];
    }
}