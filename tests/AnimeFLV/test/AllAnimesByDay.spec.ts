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

async function processInChunks<T>(
    items: T[],
    chunkSize: number,
    callback: (item: T, index: number) => Promise<void>
) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await Promise.all(chunk.map((item, idx) => callback(item, i + idx)));
    }
}

const webhook = process.env.SERVER_API || '';
const secret = process.env.SERVER_SECRET || '';
test.setTimeout(20 * 60 * 1000);
test('scrapping animeflv', async ({ page }) => {
    let data = new Data("AnimeFLV", "https://animeflv.net");
    const user = new User("Otaku", data.getPage);

    await user.attemptsTo(
        async () => {
            const homePage = new HomePage(page, user.getPage());
            await homePage.init();
            let animates = await getAllAnimeByDayTask(user)(homePage);
            await processInChunks(
                animates,
                1,
                async (anime) => {
                    await processInChunks(
                        anime.caps,
                        5,
                        async (cap) => {
                            try {
                                const specificCap = new SpecificCap(await page.context().newPage(), data.getPage + cap.link);
                                await specificCap.init();
                                await specificCap.getPage.waitForTimeout(2000);
                                await getProvider()(cap, specificCap);
                                await specificCap.getPage.close();
                            } catch (err) {
                                console.error(`Error procesando cap ${cap.number} de ${anime.slug}:`, err);
                            }
                        }
                    );
                }
            );
            homePage.getPage.close();
            let pathToJson = generateFileWithResults(animates, "");
            const headers = {
                'X-Webhook-Token': secret
            };
            await SendJsonToWebHook(webhook + "/webhook/send-animes-today", pathToJson, headers);
        });
});

/*
Los formularios debe de validar el contenido y no permitir enviar datos vacíos o incorrectos.
Hay un segundo perfil de admin para los ayudantes del admin 

 */