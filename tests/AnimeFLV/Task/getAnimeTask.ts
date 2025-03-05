import {HomePage} from "../Page/HomePage";
import {Anime, Episode} from "../Data/json";
import {User} from "../Actor/User";

export const getAllAnimeByDayTask = (user: User) => {
    return async function (page: HomePage): Promise<Anime[]> {
        const listOfAnimeByDay = await page.getListOfAnimeByDay();
        let animates: Anime[] = [];
        for (const animeOfDay of listOfAnimeByDay) {
            const title = await page.getTitleOfAnime(animeOfDay);
            const link = await page.getLinkToAnime(animeOfDay) ?? "";
            const image = await page.getImageOfAnime(animeOfDay);
            let capNumber: string = await page.getCamNumber(animeOfDay);
            capNumber = capNumber.split(" ")[1];
            const slug = title.toLowerCase().replace(/ /g, "-");
            let anime = new Anime(title.split(" "), slug, "", user.getPage() + image);
            let cap = new Episode(title, Number(capNumber), link);
            anime.AddCap(cap);
            animates.push(anime);
        }
        return animates;
    };
}