import {DirectoryOfAnimes} from "../Page/DirectoryOfAnimes";
import {Locator} from "@playwright/test";

export class DirectoryOfAllAnimes {
    private readonly directory: DirectoryOfAnimes;

    constructor(directory: DirectoryOfAnimes) {
        this.directory = directory;
    }

    public getPath(): string {
        return this.directory.getPath;
    }

    public async pageIsReady() {
        await this.directory.getPage.waitForSelector(this.directory.getAnimeList, {state: 'visible'});
    }

    public async getListOfAnimes(): Promise<Locator[]> {
        return await this.directory.getPage.locator(this.directory.getAnimeList).all();
    }

    public async getAnimeName(anime: Locator): Promise<string> {
        return await anime.locator(this.directory.getAnimeName).innerText();
    }

    public async getAnimeLink(anime: Locator): Promise<string> {
        return (await anime.locator(this.directory.getAnimeLink).first().getAttribute('href')) ?? '';
    }

    public async getAnimeImage(anime: Locator): Promise<string> {
        return await anime.locator(this.directory.getAnimeImage).first().getAttribute('src') ?? '';
    }

    public async nextPage() {
        await this.directory.getPage.locator(this.directory.getNext).click();
    }
}