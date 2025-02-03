export class Data{
    private caps_today: Capitulo[] = [];
    constructor(public name: string) {}

    public async addCap(cap: Capitulo){
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


}


export class Capitulo {
    private url: string;
    private title: string;
    private view_url: string[] = [];
    constructor(url: string, title: string) {
        this.url = url;
        this.title = title;
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
}