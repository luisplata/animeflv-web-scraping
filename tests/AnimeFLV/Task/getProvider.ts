import { Locator, Page } from "@playwright/test";
import { User } from "../Actor/User";
import { Capitulo } from "../Data/data";
import { SpecificCap } from "../Page/SpecificCap";

export const getProvider = (userFrom: User) => async (cap: Capitulo, page: SpecificCap) => {
    console.log("🔗 Cap::", cap.getTitle, cap.getUrl);
    const capPage = await page.getListOfOptions();
    for (let option of capPage) {
        let titleOption = await page.getTitleOfOption(option);
        if (titleOption === userFrom.getProvider()) {
            let megaUrl = await page.getIframeMega(option);
            await cap.addViewUrl(megaUrl);
        }
    }
};