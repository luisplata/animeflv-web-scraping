import {Locator, test} from "@playwright/test";
import {Capitulo, Data} from "../Data/data";
import {User} from "../Actor/User";
import {DirectoryOfAnimes} from "../Page/DirectoryOfAnimes";
import {DirectoryOfAllAnimes} from "../Task/directoryAllAnimes";
import {HomePage} from "../Page/HomePage";
import {SpecificAnime} from "../Page/SpecificAnime";
import {GetAllCapsByAnime} from "../Task/getAllCapsByAnime";
import {SpecificCap} from "../Page/SpecificCap";
import {getProvider} from "../Task/getProvider";
import {sendToDiscord} from "../Task/sendToDiscord";


class AnimeTarget {
    name: string[];
    link: string;
    found: boolean;
    image: string;
    fullname: string;
    caps: Capitulo[];

    constructor(names: string[]) {
        this.name = names;
        this.link = "";
        this.found = false;
        this.image = "";
        this.fullname = "";
        this.caps = [];
    }
}

test('AnimeFLV', async ({page}) => {
    let data = new Data("AnimeFLV");

    const animeTargets = [
        // new AnimeTarget(["shiawase", "kekkon"]),
        // new AnimeTarget(["kaisha", "suki", "imasu"]),
        new AnimeTarget(["behemoth", "machigawarete", "kurashitemasu"]),
        // new AnimeTarget(["kunoichi", "dousei", "hajimemashita"]),
        // new AnimeTarget(["tensei", "ojisan"]),
        // new AnimeTarget(["sakamoto", "days"]),
        // new AnimeTarget(["otoko", "isekai", "tsuuhan"]),
        //new AnimeTarget(["Tensei", "Majutsu", "Kiwamemasu"]),
    ];

    const user = new User("Otaku", data.getProvider, data.getPage);
    await user.attemptsTo(
        async () => {
            const homePage = new HomePage(page, user.getPage());
            await homePage.init();
            await Promise.all(
                animeTargets.map(async (target) => {
                    console.log("By Target", target);
                    const directoryMap = new DirectoryOfAnimes(await homePage.getPage.context().newPage(), user.getPage());
                    await directoryMap.init();
                    let animeFound = false;
                    let allAnimesTask = new DirectoryOfAllAnimes(directoryMap);
                    do {
                        let allAnimes = await allAnimesTask.getListOfAnimes();
                        //await allAnimesTask.pageIsReady();
                        for (let anime of allAnimes) {
                            let name = await allAnimesTask.getAnimeName(anime);
                            let link = await allAnimesTask.getAnimeLink(anime);
                            let image = await allAnimesTask.getAnimeImage(anime);
                            //check if `name` contains all the words in the array
                            if (target.name.every((word: string) => name.toLowerCase().includes(word.toLowerCase()))) {
                                console.log("Found::", name, "words::", target);
                                target.link = link;
                                target.image = image;
                                target.fullname = name;
                                target.found = true;
                                animeFound = true;
                                await directoryMap.close();
                                break;
                            }
                            if (target.found) {
                                break;
                            }
                        }
                        if (!target.found) {
                            console.log("Not found::", target.name, "next");
                            try {
                                await allAnimesTask.nextPage();
                                await page.waitForTimeout(1000);
                            } catch (e) {
                                console.log("No more pages", e);
                                break;
                            }
                        } else {
                            break;
                        }
                    } while (!target.found);
                })
            );
            console.log("Anime Targets::", animeTargets);
            await Promise.all(
                animeTargets.map(async (target) => {
                        console.log("🔗 Anime::", target.fullname, target.link);
                        let specificAnime = new SpecificAnime(await page.context().newPage(), user.getPage() + target.link);
                        await specificAnime.init();
                        let specificAnimeTask = new GetAllCapsByAnime(specificAnime);
                        let animeName = await specificAnimeTask.getTitleOfAnime();
                        let caps = await specificAnimeTask.getListOfCaps();
                        if (animeName === target.fullname && await specificAnimeTask.isFinished("Finalizado")) {
                            await processCaps(caps, 0, specificAnimeTask, target);
                        } else {
                            await processCaps(caps, 1, specificAnimeTask, target);
                        }
                    }
                )
            );
            console.log("Anime Targets::", animeTargets);
            await Promise.all(
                animeTargets.map(async (target) => {
                    await Promise.all([
                            target.caps.map(async (cap) => {
                                console.log("🔗 Cap::", cap.getTitle, cap.getUrl);
                                let specificCap = new SpecificCap(await page.context().newPage(), user.getPage() + cap.getUrl);
                                await specificCap.init();
                                await getProvider(user)(cap, specificCap);
                            })
                        ]
                    );
                    await sendToDiscord()(user, data, target.caps);
                })
            );
        });
});


async function processCaps(caps: Locator[], startIndex: number, specificAnimeTask: GetAllCapsByAnime, target: AnimeTarget) {
    await Promise.all(
        caps.slice(startIndex).map(async (cap) => {
            try {
                let capLink = await specificAnimeTask.getCapLink(cap);
                let capNumber = await specificAnimeTask.getCapNumber(cap);
                target.caps.push(new Capitulo(capLink, capNumber));
            } catch (e) {
                console.log("Error::", e);
            }
        })
    );
}