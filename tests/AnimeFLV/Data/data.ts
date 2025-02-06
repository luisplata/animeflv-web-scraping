export class Data {
    private readonly caps_today: Capitulo[] = [];
    private readonly animes = nameOfAnimeToSendDiscord;
    private readonly provider = PROVIDER;
    private readonly webhookUrl = webHook;
    private readonly page = page;

    constructor(public name: string) {
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
        for (const anime of this.animes) {
            //need to check if all words are in the name
            let found = true;
            for (const word of anime) {
                if (!name.toLowerCase().includes(word.toLowerCase())) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }

        }
        return false;
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

export const nameOfAnimeToSendDiscord = [
    ["shiawase", "kekkon"],
    ["kaisha", "suki", "imasu"],
    ["behemoth", "machigawarete", "kurashitemasu"],
    ["kunoichi", "dousei", "hajimemashita"],
    ["tensei", "ojisan"],
    ["sakamoto", "days"],
    ["otoko", "isekai", "tsuuhan"],
];
export const webHook = "https://discordapp.com/api/webhooks/1337063698497273978/_t3TPDrX8OHosD6Uap065EfCDXLq2QIdHAy5vqra0_BO2PxaI-uG8i-SAEEzf33uL55H";
export const page = "https://animeflv.net";
export const PROVIDER = "Mega";