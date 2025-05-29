import { BasePage } from "../../../Page/BasePage";
import { Locator } from '@playwright/test';

export class SpecificCap extends BasePage {
    private readonly listOfOptions = "//ul[@role='tablist']/li";
    private readonly titleOfOption = "data-original-title";
    private readonly titleOfOptionAlt = "title";
    private readonly linkToViewCap = "//div[@id='video_box']";

    public async getListOfOptions(): Promise<Locator[]> {
        return await this.page.locator(this.listOfOptions).all();
    }

    public async getTitleOfOption(option: Locator): Promise<string> {
        return await option.getAttribute(this.titleOfOption) ?? await option.getAttribute(this.titleOfOptionAlt) ?? '';
    }

    public async getLinkToView(option: Locator): Promise<string> {
        let popupOpened = false;
        let retryCount = 0;
        const maxRetries = 5;

        do {
            if (this.page.isClosed()) {
                console.log("❌ La página se cerró inesperadamente.");
                return '';
            }

            const [popup] = await Promise.all([
                this.page.waitForEvent('popup', { timeout: 4000 }).catch(() => null),
                option.click(),
            ]);

            if (popup) {
                console.log("❌ Popup detectado. Cerrándolo...");
                await popup.close();
                popupOpened = true;
            } else {
                popupOpened = false;
            }

            await this.page.waitForTimeout(2000);
            retryCount++;
            if (retryCount > maxRetries) {
                console.log("⚠️ Demasiados popups, abortando.");
                return '';
            }
        } while (popupOpened);

        // Buscar el div primero
        try {
            const videoBox = this.page.locator(this.linkToViewCap);
            await videoBox.first().waitFor({ state: 'attached', timeout: 5000 });
            if (await videoBox.count() === 0) {
                console.log("⚠️ video_box div not found.");
                return '';
            }

            // Buscar el iframe dentro del div
            const iframe = videoBox.locator("iframe");
            await iframe.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => { });
            if (await iframe.count() === 0) {
                console.log("⚠️ iframe not found inside video_box.");
                return '';
            }

            // Esperar a que el src esté presente
            const src = await iframe.first().getAttribute("src");
            if (!src) {
                console.log("⚠️ iframe src attribute not found.");
                return '';
            }

            // Opcional: Validar si el src es un enlace válido
            if (!/^https?:\/\//.test(src)) {
                console.log("⚠️ iframe src is not a valid URL:", src);
                return '';
            }

            console.log("✅ video found!::", src);
            return src;
        } catch (error) {
            console.log("❌ Error al buscar el video:", error);
            return '';
        }
    }

}