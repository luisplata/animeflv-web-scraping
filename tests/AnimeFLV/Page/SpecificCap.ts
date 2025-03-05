import {BasePage} from "../../../Page/BasePage";
import {Locator} from '@playwright/test';

export class SpecificCap extends BasePage {
    private readonly listOfOptions = "//ul[@role='tablist']/li";
    private readonly titleOfOption = "data-original-title";
    private readonly titleOfOptionAlt = "title";
    private readonly linkToViewCap = "//div[@id='video_box']/iframe";

    public async getListOfOptions(): Promise<Locator[]> {
        return await this.page.locator(this.listOfOptions).all();
    }

    public async getTitleOfOption(option: Locator): Promise<string> {
        return await option.getAttribute(this.titleOfOption) ?? await option.getAttribute(this.titleOfOptionAlt) ?? '';
    }

    public async getLinkToView(option: Locator): Promise<string> {
        let popupOpened = false;
        do {
            const [popup] = await Promise.all([
                this.page.waitForEvent('popup', {timeout: 4000}).catch(() => null),
                option.click(),
            ]);

            if (popup) {
                console.log("❌ Popup detectado. Cerrándolo...");
                await popup.close();
                popupOpened = true;
            } else {
                popupOpened = false;
            }

            if (!this.page.isClosed()) {
                await this.page.waitForTimeout(2000);
            }

        } while (popupOpened);

        let mega = await this.page.locator(this.linkToViewCap).first();
        if (mega) {
            let src = await mega.getAttribute("src");
            console.log("✅ video found!::", src);
            if (src) {
                return src;
            }
        }
        return '';
    }

}