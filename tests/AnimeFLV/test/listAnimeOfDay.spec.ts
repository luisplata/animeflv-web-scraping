import {test} from '@playwright/test';
import {User} from '../Actor/User';
import {HomePage} from '../Page/HomePage';
import {Data, AnimeTarget} from '../Data/data';
import {getAnimeByDayTask} from '../Task/getAnimeTask';
import {SpecificCap} from '../Page/SpecificCap';
import {getProvider} from '../Task/getProvider';
import {sendToDiscord} from "../Task/sendToDiscord";
import {generateFileWithResults} from '../Task/GenerateFileWithResults';

const animeName: string = process.env.ANIME_NAME || '[]';
const discordWebhook = process.env.DISCORD_WEBHOOK || '';
const provider = process.env.PROVIDER || 'mega';

test('scrapping animeflv', async ({page}) => {
    let data = new Data("AnimeFLV", "https://animeflv.net", provider, discordWebhook);
    const user = new User("Otaku", data.getProvider, data.getPage);

    const animeTargets: AnimeTarget[] = [];
    animeTargets.push(new AnimeTarget(animeName.split(" ")));

    animeTargets.map((target) => {
        data.setAnimes(target.name);
    });

    await user.attemptsTo(
        async () => {
            const homePage = new HomePage(page, user.getPage());
            await homePage.init();
            await getAnimeByDayTask()(user, homePage, data, animeTargets);
            await Promise.all(
                animeTargets.map(async (target) => {
                    const specificCap = new SpecificCap(await page.context().newPage(), target.link);
                    await specificCap.init();
                    await specificCap.getPage.waitForTimeout(2000);
                    await Promise.all(
                        target.caps.map(async (cap) => {
                            await getProvider(user)(cap, specificCap);
                        })
                    );
                })
            );

            if (data.getWebhookUrl !== "") {
                await Promise.all(
                    animeTargets.map(async (target) => {
                        await sendToDiscord()(user, data.getWebhookUrl, target.caps);
                    })
                );
            } else {
                generateFileWithResults(animeTargets, "of_day");
            }
        });
});