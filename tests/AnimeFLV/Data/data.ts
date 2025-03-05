import {Anime} from "./json";

export class Data {
    private readonly page: string;
    private readonly animes: Anime[];

    constructor(public name: string, page: string) {
        this.page = page;
    }

    public get getPage(): string {
        return this.page;
    }

    public get getAnimes(): Anime[] {
        return this.animes;
    }

    AddAnime(anime: Anime) {
        this.animes.push(anime);
    }
}