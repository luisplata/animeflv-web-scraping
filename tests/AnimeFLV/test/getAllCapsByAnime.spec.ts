import {Locator, test} from "@playwright/test";
import {DirectoryOfAnimes} from "../Page/DirectoryOfAnimes";
import {DirectoryOfAllAnimes} from "../Task/directoryAllAnimes";
import {HomePage} from "../Page/HomePage";
import {SpecificAnime} from "../Page/SpecificAnime";
import {GetAllCapsByAnime} from "../Task/getAllCapsByAnime";
import {SpecificCap} from "../Page/SpecificCap";
import {getProvider} from "../Task/getProvider";
import {sendToDiscord} from "../Task/sendToDiscord";
import {generateFileWithResults} from "../Task/GenerateFileWithResults";

const animeName: string = process.env.ANIME_NAME || '[]';
const discordWebhook = process.env.DISCORD_WEBHOOK || '';
const provider = process.env.PROVIDER || 'mega';


test.setTimeout(10 * 60 * 1000);

test('Get all caps by anime name', async ({page}) => {
    // let data = new Data("AnimeFLV", "https://animeflv.net", provider, discordWebhook);
    // const user = new User("Otaku", data.getProvider, data.getPage);
    //
    // const animeTargets: AnimeTarget[] = [];
    // animeTargets.push(new AnimeTarget(animeName.split(" ")));
    //
    // animeTargets.map((target) => {
    //     data.setAnimes(target.name);
    // });
    // await user.attemptsTo(
    //     async () => {
    //         const homePage = new HomePage(page, user.getPage());
    //         await homePage.init();
    //         await Promise.all(
    //             animeTargets.map(async (target) => {
    //                 //console.log("By Target", target);
    //                 const directoryMap = new DirectoryOfAnimes(await page.context().newPage(), user.getPage());
    //                 await directoryMap.init();
    //                 let animeFound = false;
    //                 let allAnimesTask = new DirectoryOfAllAnimes(directoryMap);
    //                 do {
    //                     let allAnimes = await allAnimesTask.getListOfAnimes();
    //                     //await allAnimesTask.pageIsReady();
    //                     for (let anime of allAnimes) {
    //                         let name = await allAnimesTask.getAnimeName(anime);
    //                         let link = await allAnimesTask.getAnimeLink(anime);
    //                         let image = await allAnimesTask.getAnimeImage(anime);
    //                         //check if `name` contains all the words in the array
    //                         if (target.name.every((word: string) => name.toLowerCase().includes(word.toLowerCase()))) {
    //                             //console.log("Found::", name, "words::", target);
    //                             target.link = data.getPage + link;
    //                             target.image = image;
    //                             target.fullname = name;
    //                             target.found = true;
    //                             animeFound = true;
    //                             await directoryMap.getPage.close();
    //                             break;
    //                         }
    //                         if (target.found) {
    //                             break;
    //                         }
    //                     }
    //                     if (!target.found) {
    //                         console.log("Not found::", target.name, "next");
    //                         try {
    //                             await allAnimesTask.nextPage();
    //                             await page.waitForTimeout(1000);
    //                         } catch (e) {
    //                             console.log("No more pages", e);
    //                             break;
    //                         }
    //                     } else {
    //                         break;
    //                     }
    //                 } while (!target.found);
    //             })
    //         );
    //         await Promise.all(
    //             animeTargets.map(async (target) => {
    //                 //console.log("🔗 Anime::", target.fullname, target.link);
    //                 let specificAnime = new SpecificAnime(await homePage.getPage.context().newPage(), target.link);
    //                 await specificAnime.init();
    //                 let specificAnimeTask = new GetAllCapsByAnime(specificAnime);
    //                 let animeName = await specificAnimeTask.getTitleOfAnime();
    //                 let caps = await specificAnimeTask.getListOfCaps();
    //                 if (animeName === target.fullname) {
    //                     await Promise.all(
    //                         caps.slice(await specificAnimeTask.isFinished("Finalizado") ? 0 : 1).map(async (cap) => {
    //                             try {
    //                                 let capLink = await specificAnimeTask.getCapLink(cap);
    //                                 let capNumber = await specificAnimeTask.getCapNumber(cap);
    //                                 target.caps.push(new Capitulo(data.getPage + capLink, animeName + " - " + capNumber, target.image));
    //                             } catch (e) {
    //                                 console.log("Error::", e);
    //                             }
    //                         })
    //                     );
    //                 }
    //                 specificAnime.getPage.close();
    //                 await Promise.all(
    //                     animeTargets.map(async (target) => {
    //                         //console.log("Caps:", target.caps);
    //                         await Promise.all(
    //                             target.caps.map(async (cap) => {
    //                                 console.log("🔗 Cap::", cap.getTitle, cap.getUrl);
    //                                 let specificCap = new SpecificCap(await homePage.getPage.context().newPage(), cap.getUrl);
    //                                 await specificCap.init();
    //                                 await getProvider(user)(cap, specificCap);
    //                             })
    //                         );
    //                     })
    //                 );
    //                 await homePage.getPage.close();
    //             })
    //         );
    //         //console.log("Anime Targets with caps::", animeTargets);
    //     });
    //
    //
    // if (data.getWebhookUrl !== "") {
    //     animeTargets.map(async (target) => {
    //         await sendToDiscord()(user, data.getWebhookUrl, target.caps);
    //     });
    // }
    // generateFileWithResults(animeTargets, "all_caps");
});