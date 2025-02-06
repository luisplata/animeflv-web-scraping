import {test, expect} from '@playwright/test';
import {User} from '../Actor/User';
import {HomePage} from '../Page/HomePage';
import {Data} from '../Data/data';
import {getAnimeByDayTask} from '../Task/getAnimeTask';

import {SpecificCap} from '../Page/SpecificCap';
import {getProvider} from '../Task/getProvider';
import {sendToDiscord} from "../Task/sendToDiscord";

test('scrapping animeflv', async ({page}) => {

    const user = new User("Otaku", "MEGA", "https://animeflv.net");
    const nameOfAnimeToSendDiscord = [
        ["shiawase", "kekkon"],
        ["kaisha", "suki", "imasu"],
        ["behemoth", "machigawarete", "kurashitemasu"],
        ["kunoichi", "dousei", "hajimemashita"],
        ["tensei", "ojisan"],
        ["sakamoto", "days"],
        ["otoko", "isekai", "tsuuhan"],
    ];
    const webHook = "https://discordapp.com/api/webhooks/1337063698497273978/_t3TPDrX8OHosD6Uap065EfCDXLq2QIdHAy5vqra0_BO2PxaI-uG8i-SAEEzf33uL55H";
    let data = new Data("AnimeFLV", nameOfAnimeToSendDiscord, webHook);

    await user.attemptsTo(
        async () => {
            const homePage = new HomePage(page, user.getPage());
            await homePage.init();
            await getAnimeByDayTask()(user, homePage, data);
            await Promise.all(
                data.getCapitulos().map(async (cap) => {
                    console.log("🔗 Cap::", cap.getTitle, cap.getUrl);
                    const specificCap = new SpecificCap(await page.context().newPage(), user.getPage() + cap.getUrl);
                    await specificCap.init();
                    await getProvider(user)(cap, specificCap);
                })
            );
            await sendToDiscord()(user, data);
        });
});