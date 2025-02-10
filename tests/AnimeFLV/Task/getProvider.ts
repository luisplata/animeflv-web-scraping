import { Locator, Page } from "@playwright/test";
import { User } from "../Actor/User";
import { Capitulo } from "../Data/data";
import { SpecificCap } from "../Page/SpecificCap";

export const getProvider = (userFrom: User) => async (cap: Capitulo, page: SpecificCap) => {
    const capPage = await page.getListOfOptions();
    for (let option of capPage) {
        let titleOption = await page.getTitleOfOption(option);
        if (titleOption.toLowerCase() === userFrom.getProvider().toLowerCase()) {
            let megaUrl = await page.getIframeMega(option);
            console.log("🔗 Cap to get provider::", cap.getTitle, cap.getUrl, userFrom.getProvider(), megaUrl);
            await cap.addViewUrl(megaUrl);
        }
    }
};