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

dotenv.config();

const webhook = process.env.SERVER_API || '';
const secret = process.env.SERVER_SECRET || '';
test.setTimeout(10 * 60 * 1000);
test('scrapping animeflv', async ({ page }) => {
    let data = new Data("AnimeFLV", "https://animeflv.net");
    const user = new User("Otaku", data.getPage);

    await user.attemptsTo(
        async () => {
            const homePage = new HomePage(page, user.getPage());
            await homePage.init();
            let animates = await getAllAnimeByDayTask(user)(homePage);
            await Promise.all(
                animates.map(
                    async (anime) => {
                        //console.log(anime);
                        await Promise.all(
                            anime.caps.map(
                                async (cap) => {
                                    const specificCap = new SpecificCap(await page.context().newPage(), data.getPage + cap.link);
                                    await specificCap.init();
                                    await specificCap.getPage.waitForTimeout(2000);
                                    await getProvider()(cap, specificCap);
                                    await specificCap.getPage.close();
                                }
                            )
                        );
                    }
                )
            );
            homePage.getPage.close();
            let pathToJson = generateFileWithResults(animates, "");
            const headers = {
                'X-Webhook-Token': secret
            };
            await SendJsonToWebHook(webhook+"/webhook/send-animes-today", pathToJson, headers);
        });
});