import { HomePage } from "../Page/HomePage";
import { Anime, Episode } from "../Data/json";
import { User } from "../Actor/User";

export const getAllAnimeByDayTask = (user: User) => {
    return async function (page: HomePage): Promise<Anime[]> {
        const listOfAnimeByDay = await page.getListOfAnimeByDay();
        let animates: Anime[] = [];
        for (const animeOfDay of listOfAnimeByDay) {
            try {
                const title = await page.getTitleOfAnime(animeOfDay);
                if (!title) continue;

                const link = await page.getLinkToAnime(animeOfDay) ?? "";
                const image = await page.getImageOfAnime(animeOfDay) ?? "";
                let capNumber: string = await page.getCamNumber(animeOfDay) ?? "";
                const capNumberParts = capNumber.split(" ");
                const capNum = capNumberParts[1] ? Number(capNumberParts[1]) : 1;
                const slug = title.toLowerCase().replace(/ /g, "-");

                let anime = new Anime(title.split(" "), slug, "", user.getPage() + image);
                let cap = new Episode(title, capNum, link);
                anime.AddCap(cap);
                animates.push(anime);
            } catch (error) {
                console.warn("Error processing animeOfDay:", error);
                continue;
            }
        }
        return animates;
    };
}