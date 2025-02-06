import {SpecificAnime} from "../Page/SpecificAnime";
import {Locator} from "@playwright/test";

export class GetAllCapsByAnime {
    private specificAnime: SpecificAnime;

    constructor(specificAnime: SpecificAnime) {
        this.specificAnime = specificAnime;
    }

    public async getTitleOfAnime(): Promise<string> {
        return await this.specificAnime.getPage.locator(this.specificAnime.getAnimeName).innerText();
    }

    public async getListOfCaps(): Promise<Locator[]> {
        return await this.specificAnime.getPage.locator(this.specificAnime.getListOfOptions).all();
    }

    public async getCapLink(cap: Locator): Promise<string> {
        let link = await cap.locator(this.specificAnime.getAnimeCap).first().getAttribute('href');
        if (link && link !== '#') {
            return link;
        }
        throw new Error("❌ No se ha encontrado el link del capítulo");
    }


    public async getCapNumber(cap: Locator): Promise<string> {

        return await cap.locator(this.specificAnime.getAnimeCapNumber).innerText();
    }

    public async isFinished(isFinished: string): Promise<boolean> {
        let name = this.specificAnime.getPage.locator(this.specificAnime.getIsFinished).first();
        return await name.innerText() === isFinished;
    }

    public async processCaps(caps: Locator[], startIndex: number, specificAnimeTask: GetAllCapsByAnime) {
        await Promise.all(
            caps.slice(startIndex).map(async (cap) => {
                try {
                    let capLink = await specificAnimeTask.getCapLink(cap);
                    let capNumber = await specificAnimeTask.getCapNumber(cap);
                    console.log("🔗 Cap::", capNumber, capLink);
                } catch (e) {
                    console.log("Error::", e);
                }
            })
        );
    }
}