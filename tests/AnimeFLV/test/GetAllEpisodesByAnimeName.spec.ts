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

dotenv.config();

const discordWebhook = process.env.DISCORD_WEBHOOK || '';
const webhook = process.env.SERVER_WEBHOOK || '';
const url_api = process.env.SERVER_API || '';
const secret = process.env.SERVER_SECRET || '';
test.setTimeout(10 * 60 * 1000);
test('scrapping animeflv', async ({ page }) => {
    let data = new Data("AnimeFLV", "https://animeflv.net");
    const user = new User("Otaku", data.getPage);
    await user.attemptsTo(
        async () => {
            const directoryMap = new DirectoryOfAnimes(page, user.getPage());
            await directoryMap.init();
            let animeFound = false;
            let animeData: Anime[] = [];
            let finalAnimeData: Anime[] = [];
            //Get all animes in directory
            let allAnimesTask = new DirectoryOfAllAnimes(directoryMap);
            do {
                //Guardamos todos los animes del directorio
                let allAnimes = await allAnimesTask.getListOfAnimes();
                await Promise.all(
                    allAnimes.map(async (animeDirectory) => {
                        let name = await allAnimesTask.getAnimeName(animeDirectory);
                        let link = await allAnimesTask.getAnimeLink(animeDirectory);
                        let image = await allAnimesTask.getAnimeImage(animeDirectory);
                        const slug = name.toLowerCase().replace(/ /g, "-");
                        animeData.push(new Anime(name.split(" "), slug, link, image));
                    })
                );

                //new version!
                for (const anime of animeData) {
                    let specificAnime = new SpecificAnime(await directoryMap.getPage.context().newPage(), data.getPage + anime.description);
                    await specificAnime.init();
                    let specificAnimeTask = new GetAllCapsByAnime(specificAnime);
                    let animeName = await specificAnimeTask.getTitleOfAnime();
                    let caps = await specificAnimeTask.getListOfCaps();

                    await Promise.all(caps.slice(await specificAnimeTask.isFinished("Finalizado") ? 0 : 1).map(async (cap) => {
                        try {
                            let capLink = await specificAnimeTask.getCapLink(cap);
                            let capNumber = await specificAnimeTask.getCapNumber(cap);
                            //parseInt(text.replace(/\D/g, ""), 10);
                            let capi = new Episode(animeName, parseInt(capNumber.replace(/\D/g, ""), 10), capLink);
                            anime.caps.push(capi);
                        } catch (e) {
                            console.log("Error::", e);
                        }
                    }));

                    let animeFromServer = await proccessDataToAnimeDetail(url_api + "/anime/" + anime.slug);
                    const isValid = validateEpisodes(anime, animeFromServer);
                    if (isValid) {
                        console.log(`Anime ${anime.name} has all episodes (${anime.caps.length}). Skipping...`);
                        specificAnime.getPage.close();
                        continue;
                    }

                    await Promise.all(
                        anime.caps.map(
                            async (cap) => {
                                const specificCap = new SpecificCap(await page.context().newPage(), data.getPage + cap.link);
                                await specificCap.init();
                                await specificCap.getPage.waitForTimeout(2000);
                                await getProvider()(cap, specificCap);
                            }
                        )
                    );

                    animeFound = true;
                    finalAnimeData.push(anime);
                    break;
                }
                if (!animeFound) {
                    try {
                        await allAnimesTask.nextPage();
                        await page.waitForTimeout(1000);
                    } catch (e) {
                        console.log("No more pages", e);
                        break;
                    }
                }
            } while (!animeFound);
            let pathToJson = generateFileWithResults(finalAnimeData, "test_local");
            const headers = {
                'X-Webhook-Token': secret
            };
            await SendJsonToWebHook(webhook, pathToJson, headers);
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
    const animeDataEpisodes = animeData.caps.map(ep => ep.number);
    const serverEpisodes = animeFromServer.episodes.map(ep => ep.number);

    // Check if every episode in animeData is present in animeFromServer
    return animeDataEpisodes.every(ep => serverEpisodes.includes(ep));
}