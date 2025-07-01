import { HomePage } from "../Page/HomePage";
import { Anime, Episode } from "../Data/json";
import { User } from "../Actor/User";
import {
    generateSlug
} from "../Task/GetLastPaginationFromWebHook";

const webhook = process.env.SERVER_API || '';

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
                const slug = generateSlug(title);

                // Validación: ¿Ya existe el anime y el cap en el backend?
                let url = `${webhook}/animes/search_specific?q=${slug}`;
                //console.log(`Consultando el backend para el anime: ${url}`);
                const response = await fetch(url);
                if (!response.ok) {
                    console.error(`Error al consultar el anime ${slug} en el backend:`, response.statusText);
                    continue;
                }
                const animeData = await response.json();
                if (!animeData || !animeData.data || animeData.data.length === 0) {
                    // El anime no existe, lo procesamos normalmente
                    // Si llegamos aquí, el cap no existe y lo agregamos
                    let anime = new Anime(title.split(" "), slug, "", user.getPage() + image);
                    let cap = new Episode(title, capNum, link);
                    anime.AddCap(cap);
                    animates.push(anime);
                } else {
                    // El anime existe, revisamos los caps
                    const backendSlug = animeData.data[0].slug;
                    let allAnime = `${webhook}/anime/${backendSlug}`;
                    //console.log(`Consultando el backend para los caps del anime: ${allAnime}`);
                    const capResponse = await fetch(allAnime);
                    if (!capResponse.ok) {
                        console.error(`Error al consultar el cap ${capNum} del anime ${backendSlug} en el backend:`, capResponse.statusText);
                        continue;
                    }
                    const capData = await capResponse.json();
                    capData.episodes = capData.episodes || [];
                    if (capData.episodes.some((ep: any) => Number(ep.number) === Number(capNum))) {
                        // Ya existe el cap, no lo agregamos
                        console.log(`El cap ${capNum} del anime ${backendSlug} ya existe en el backend.`);
                        continue;
                    }
                }
            } catch (error) {
                console.warn("Error processing animeOfDay:", error);
                continue;
            }
        }
        return animates;
    };
}