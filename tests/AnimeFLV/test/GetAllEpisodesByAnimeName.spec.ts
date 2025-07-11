import { test } from "@playwright/test";
import { Data } from "../Data/data";
import { User } from "../Actor/User";
import { HomePage } from "../Page/HomePage";
import { getAllAnimeByDayTask } from "../Task/getAnimeTask";
import { SpecificCap } from "../Page/SpecificCap";
import { getProvider } from "../Task/getProvider";
import { generateFileWithResults } from "../Task/GenerateFileWithResults";
import { SendJsonToWebHook } from "../Task/SendJsonToWebHook";
import * as dotenv from 'dotenv';
import { DirectoryOfAnimes } from "../Page/DirectoryOfAnimes";
import { DirectoryOfAllAnimes } from "../Task/directoryAllAnimes";
import { SpecificAnime } from "../Page/SpecificAnime";
import { GetAllCapsByAnime } from "../Task/getAllCapsByAnime";
import { Anime, Episode } from "../Data/json";
import {
    generateSlug,
    GetLastPaginationFromWebHook,
    SendLastPaginationToWebHook
} from "../Task/GetLastPaginationFromWebHook";
import { GetMetadata } from "../Task/getMetaData";

dotenv.config();

const webhook = process.env.SERVER_API || '';
const url_api = process.env.SERVER_API || '';
const secret = process.env.SERVER_SECRET || '';
const MAX_PAGES = Number(process.env.ANIMEFLV_MAX_PAGES) || 150;
const MAX_CYCLES = Number(process.env.ANIMEFLV_MAX_CYCLES) || 3;

test.setTimeout(10 * 60 * 1000);
const headers = {
    'X-Webhook-Token': secret
};

async function processInChunks<T>(
    items: T[],
    chunkSize: number,
    callback: (item: T, index: number) => Promise<void>
) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await Promise.all(chunk.map((item, idx) => callback(item, i + idx)));
    }
}

test('scrapping animeflv', async ({ page }) => {
    let data = new Data("AnimeFLV", "https://animeflv.net");
    const user = new User("Otaku", data.getPage);
    await user.attemptsTo(
        async () => {

            let lastPage = await GetLastPaginationFromWebHook(webhook + "/webhook", 'animeflv', headers);
            const directoryMap = new DirectoryOfAnimes(page, user.getPage(), lastPage);
            await directoryMap.init();
            let animeFound = false;
            let animeData: Anime[] = [];
            let finalAnimeData: Anime[] = [];
            //Get all animes in directory
            let allAnimesTask = new DirectoryOfAllAnimes(directoryMap);
            let cycleCount = 0
            do {
                //Guardamos todos los animes del directorio
                let allAnimes = await allAnimesTask.getListOfAnimes();
                await processInChunks(
                    allAnimes,
                    10,
                    async (animeDirectory) => {
                        let name = await allAnimesTask.getAnimeName(animeDirectory);
                        let link = await allAnimesTask.getAnimeLink(animeDirectory);
                        let image = await allAnimesTask.getAnimeImage(animeDirectory);

                        const slug = generateSlug(name);

                        animeData.push(new Anime(name.split(" "), slug, link, image));
                    }
                );

                //new version!
                for (const anime of animeData) {
                    let notFound = false;
                    let specificAnime = new SpecificAnime(await directoryMap.getPage.context().newPage(), data.getPage + anime.description);
                    await specificAnime.init();

                    const is404 = await specificAnime.getPage.locator('.Page404').count();
                    if (is404 > 0) {
                        console.log(`Página 404 detectada en: ${data.getPage + anime.description}`);
                        console.log(`Anime ${anime.name} not found. Skipping...`);
                        await specificAnime.getPage.close();
                        continue;
                    }

                    const alterNames = await GetMetadata.getAlterNames(specificAnime);
                    if (alterNames.length > 0) {
                        //alternames is a list of names
                        //console.log(`Alter names found for ${anime.name}:`, alterNames);
                        anime.alterNames = alterNames;
                    }

                    let description = await GetMetadata.getDescription(specificAnime);
                    if (description) {
                        //console.log(`Description found for ${anime.name}:`, description);
                        anime.description = description;
                    }

                    let genere = await GetMetadata.getGenere(specificAnime);
                    if (genere.length > 0) {
                        //console.log(`Genres found for ${anime.name}:`, genere);
                        anime.genres = genere;
                    }

                    let specificAnimeTask = new GetAllCapsByAnime(specificAnime);
                    await page.waitForTimeout(1000);
                    let animeName = await specificAnimeTask.getTitleOfAnime();
                    let caps = await specificAnimeTask.getListOfCaps();

                    await processInChunks(
                        caps.slice(await specificAnimeTask.isFinished("FINALIZADO") ? 0 : 1),
                        5,
                        async (cap) => {
                            try {
                                let capLink = await specificAnimeTask.getCapLink(cap);
                                let capNumber = await specificAnimeTask.getCapNumber(cap);
                                let capi = new Episode(animeName, parseInt(capNumber.replace(/\D/g, ""), 10), capLink);
                                anime.caps.push(capi);
                            } catch (e) {
                                console.log("Error::", e);
                            }
                        }
                    );

                    let animeFromServer = await proccessDataToAnimeDetail(url_api + "/anime/" + anime.slug);
                    const isValid = validateEpisodes(anime, animeFromServer);
                    if (isValid) {
                        console.log(`Anime ${anime.name} has all episodes (${anime.caps.length}). Skipping...`);
                        await specificAnime.getPage.close();
                        continue;
                    }

                    console.log(`Proccesing ${anime.name}`);

                    await processInChunks(
                        anime.caps,
                        5,
                        async (cap) => {
                            const specificCap = new SpecificCap(await page.context().newPage(), data.getPage + cap.link);
                            await specificCap.init();
                            await specificCap.getPage.waitForTimeout(2000);
                            await getProvider()(cap, specificCap);
                            await specificCap.getPage.close();
                        }
                    );
                    await specificAnime.getPage.close();
                    animeFound = true;
                    finalAnimeData.push(anime);
                    break;
                }
                if (!animeFound) {
                    try {
                        await allAnimesTask.nextPage();
                        await page.waitForTimeout(1000);
                        lastPage++;

                        if (lastPage > MAX_PAGES) {
                            console.warn(`Se alcanzó el máximo de páginas (${MAX_PAGES}). Reiniciando a 1.`);
                            lastPage = 1;
                        }

                        await SendLastPaginationToWebHook(webhook + "/webhook", 'animeflv', lastPage, headers);
                        
                        cycleCount++;
                        if (cycleCount >= MAX_CYCLES) {
                            console.warn(`Se alcanzó el máximo de ciclos (${MAX_CYCLES}) en esta ejecución.`);
                            break;
                        }
                        break;
                    } catch (e) {
                        console.log("No more pages", e);
                        break;
                    }
                }

            } while (!animeFound);
            directoryMap.getPage.close();
            let pathToJson = generateFileWithResults(finalAnimeData, "test_local");
            await SendJsonToWebHook(webhook + "/webhook/send-anime-full", pathToJson, headers);
        });
});

interface Source {
    id: number;
    episode_id: number;
    name: string;
    quality: string;
    url: string;
    created_at: string;
    updated_at: string;
}

interface EpisodeDetail {
    id: number;
    anime_id: number;
    number: number;
    title: string;
    created_at: string;
    updated_at: string;
    sources: Source[];
}

interface AnimeDetail {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    image: string;
    created_at: string;
    updated_at: string;
    episodes: EpisodeDetail[];
}

async function proccessDataToAnimeDetail(url: string): Promise<AnimeDetail> {
    try {
        console.log("Serach server: " + url);
        const response = await fetch(url);

        if (response.status === 404) {
            console.warn(`Anime not found: ${url}`);
            return {
                id: 0,
                title: "Unknown",
                slug: "",
                description: null,
                image: "",
                created_at: "",
                updated_at: "",
                episodes: []
            };
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as AnimeDetail;

    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to process data to AnimeDetail');
    }
}

function validateEpisodes(animeData: Anime, animeFromServer: AnimeDetail): boolean {
    // Convertimos ambos arrays a string para comparar correctamente
    const animeDataEpisodes = animeData.caps.map(ep => String(ep.number));
    const serverEpisodes = animeFromServer.episodes.map(ep => String(ep.number));

    console.log("AnimeDataEpisodes: ", animeDataEpisodes);
    console.log("ServerEpisodes: ", serverEpisodes);

    // Check if every episode in animeData is present in animeFromServer
    const result = animeDataEpisodes.every(ep => serverEpisodes.includes(ep));
    if (!result) {
        const missing = animeDataEpisodes.filter(ep => !serverEpisodes.includes(ep));
        console.warn('Missing episodes in server:', missing);
    }
    return result;
}
