export class Data {
    private readonly caps_today: Capitulo[] = [];

    constructor(public name: string, public nameOfAnimeToSendDiscord: string[][], public webhookUrl: string) {
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
        for (const anime of this.nameOfAnimeToSendDiscord) {
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