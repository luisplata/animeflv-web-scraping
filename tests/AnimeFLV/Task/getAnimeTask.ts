import { Actor } from "../../../Actor/Actor";
import { AnimeTarget, Capitulo, Data } from "../Data/data";
import { HomePage } from "../Page/HomePage";

export const getAnimeByDayTask = () => async (actor: Actor, page: HomePage, data: Data, animeTargets: AnimeTarget[]) => {
    await actor.attemptsTo(
        async () => {
            const listOfAnimeByDay = await page.getListOfAnimeByDay();
            for (const animeOfDay of listOfAnimeByDay) {
                const title = await page.getTitleOfAnime(animeOfDay);
                const link = await page.getLinkToAnime(animeOfDay) ?? "";
                const image = await page.getImageOfAnime(animeOfDay);
                animeTargets.map((target) => {
                    if (target.name.every((word: string) => title.toLowerCase().includes(word.toLowerCase()))) {
                        target.link = data.getPage + link;
                        target.image = data.getPage + image;
                        target.fullname = title;
                        target.found = true;
                        let cap = new Capitulo(data.getPage + link, title, data.getPage + image);
                        target.caps.push(cap);
                    }
                });
            }
        }
    );
};