import {test, expect} from '@playwright/test';
import {User} from '../Actor/User';
import {HomePage} from '../Page/HomePage';
import {Data} from '../Data/data';
import {getAnimeByDayTask} from '../Task/getAnimeTask';

import {SpecificCap} from '../Page/SpecificCap';
import {getProvider} from '../Task/getProvider';
import {sendToDiscord} from "../Task/sendToDiscord";

test('scrapping animeflv', async ({page}) => {

    let data = new Data("AnimeFLV");
    const user = new User("Otaku", data.getProvider, data.getPage);

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
            await sendToDiscord()(user, data, data.getCapitulos());
        });
});