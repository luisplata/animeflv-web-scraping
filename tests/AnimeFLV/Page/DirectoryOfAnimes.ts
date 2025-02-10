import {BasePage} from "../../../Page/BasePage";
import {Page} from "@playwright/test";

export class DirectoryOfAnimes extends BasePage {
    private readonly path = "/browse"
    private readonly animeList = "//ul[contains(@class,'ListAnimes')]/li";
    private readonly animeName = "//h3";
    private readonly animeLink = "//article/a";
    private readonly animeImage = "//img";
    private readonly next = "//a[contains(@href,'?page') and @rel = 'next']";

    constructor(page: Page, url: string) {
        url += "/browse";
        super(page, url);
    }

    public get getPath(): string {
        return this.url + this.path;
    }

    public get getAnimeList(): string {
        return this.animeList;
    }

    public get getAnimeName(): string {
        return this.animeName;
    }

    public get getAnimeLink(): string {
        return this.animeLink;
    }

    public get getAnimeImage(): string {
        return this.animeImage;
    }

    public get getNext(): string {
        return this.next;
    }
}
