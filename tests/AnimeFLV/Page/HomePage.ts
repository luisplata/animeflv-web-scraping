import {Locator} from "@playwright/test";
import {BasePage} from "../../../Page/BasePage";

export class HomePage extends BasePage {
    private readonly listOfAnimeByDay = "//ul[contains(@class, 'ListEpisodios')]/li";
    private readonly linkToAnime = "a";
    private readonly titleOfAnime = "strong";
    private readonly image = '//img';
    private readonly capi = "//span[@class='Capi']";

    public async getListOfAnimeByDay(): Promise<Locator[]> {
        return await this.page.locator(this.listOfAnimeByDay).all();
    }

    public async getLinkToAnime(anime: Locator): Promise<string | null> {
        return await anime.locator(this.linkToAnime).first().getAttribute('href');
    }

    public async getTitleOfAnime(anime: Locator): Promise<string> {
        return await anime.locator(this.titleOfAnime).innerText();
    }

    public async getImageOfAnime(anime: Locator): Promise<string> {
        return await anime.locator(this.image).first().getAttribute('src');
    }

    async getCamNumber(animeOfDay: Locator): Promise<string> {
        return await animeOfDay.locator(this.capi).innerText();
    }
}