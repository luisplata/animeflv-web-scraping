import {BasePage} from "../../../Page/BasePage";

export class SpecificAnime extends BasePage {
    private readonly path = "//div[@class='Body']//div[@class='Container']";
    private readonly animeName = this.path + "//h1";
    private readonly listOfOptions = "//ul[@id='episodeList']/li";
    private readonly animeCap = "//a";
    private readonly animeCapNumber = "//p";
    private readonly isFinished = "//aside[contains(@class,'SidebarA')]//span[@class='fa-tv']";

    public get getPath(): string {
        return this.url;
    }

    public get getAnimeName(): string {
        return this.animeName;
    }

    public get getListOfOptions(): string {
        return this.listOfOptions;
    }

    public get getAnimeCap(): string {
        return this.animeCap;
    }

    public get getAnimeCapNumber(): string {
        return this.animeCapNumber;
    }

    public get getIsFinished(): string {
        return this.isFinished;
    }

}