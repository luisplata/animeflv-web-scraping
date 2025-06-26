import { SpecificAnime } from "../Page/SpecificAnime";

export class GetMetadata {
    public static async getAlterNames(page: SpecificAnime): Promise<string[]> {
        const alterNames = await page.getPage.locator(page.getAlterNames);//return list of names
        const names: string[] = [];
        for (let i = 0; i < await alterNames.count(); i++) {
            const name = await alterNames.nth(i).innerText();
            if (name) {
                names.push(name.trim());
            }
        }
        return names;
    }

    public static async getDescription(page: SpecificAnime): Promise<string> {
        const description = await page.getPage.locator(page.getDescription);
        if (await description.count() > 0) {
            return await description.innerText();
        }
        return "";
    }

    public static async getGenere(page: SpecificAnime): Promise<string[]> {
        const genere = await page.getPage.locator(page.getGenere);
        const genres: string[] = [];
        for (let i = 0; i < await genere.count(); i++) {
            const genre = await genere.nth(i).innerText();
            if (genre) {
                genres.push(genre.trim());
            }
        }
        return genres;
    }
}