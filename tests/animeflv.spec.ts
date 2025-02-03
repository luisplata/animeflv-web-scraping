import { test, expect } from '@playwright/test';
import { Capitulo } from './AnimeFLV/Data/data';

test.describe.configure({ mode: 'parallel' });

const PROVIDER = 'MEGA';


test.describe.parallel('Animeflv', () => {
    test('Scraping Animeflv', async ({ page }) => {
        const base_url = 'https://animeflv.net';
        await page.goto(base_url, { timeout: 60000, waitUntil: 'domcontentloaded' });

        let list = await page.locator("//ul[contains(@class, 'ListEpisodios')]/li").all();
        let caps_today: Capitulo[] = [];

        for (let cap of list) {
            let url = await cap.locator("a").first().getAttribute("href");
            let name = (await cap.locator("strong").textContent()) ?? "";
            if (url) caps_today.push(new Capitulo(base_url + url, name));
        }

        // Paralelizar la navegación a cada capítulo
        await Promise.all(
            caps_today.map(async (cap) => {
                console.log("🔗 Cap::", cap.getTitle, cap.getUrl);
                const capPage = await page.context().newPage();
                
                try {
                    await capPage.goto(cap.getUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });

                    let options = await capPage.locator("//ul[@role='tablist']/li").all();
                    for (let option of options) {
                        let originalTitle = await option.getAttribute("data-original-title") ?? await option.getAttribute("title");
                        console.log("Option::", originalTitle);

                        if (originalTitle === PROVIDER) {
                            let popupOpened = false;
                            do {
                                const [popup] = await Promise.all([
                                    capPage.waitForEvent('popup', { timeout: 3000 }).catch(() => null),
                                    option.click(),
                                ]);

                                if (popup) {
                                    console.log("❌ Popup detectado. Cerrándolo...");
                                    await popup.close();
                                    popupOpened = true;
                                } else {
                                    popupOpened = false;
                                }

                                if (!capPage.isClosed()) {
                                    await capPage.waitForTimeout(1000);
                                }

                            } while (popupOpened);

                            let mega = await capPage.locator("iframe[src*='mega.nz']").first();
                            if (mega) {
                                let src = await mega.getAttribute("src");
                                //console.log("✅ Mega encontrado::", src);
                                if (src) {
                                    cap.addViewUrl(src);
                                }
                                break;
                            }
                        }
                    }
                } catch (error) {
                    console.error("❌ Error al cargar el capítulo:", cap.getUrl, error);
                } finally {
                    await capPage.close();
                }
            })
        );
        console.log("🔗 Caps:", caps_today);
    });
});
