import { test } from "@playwright/test";
import { SpecificAnime } from "../Page/SpecificAnime";
import { SendJsonToWebHook } from "../Task/SendJsonToWebHook";
import * as dotenv from 'dotenv';

dotenv.config();

const webhook = process.env.SERVER_API || '';
const secret = process.env.SERVER_SECRET || '';
const headers = {
    'X-Webhook-Token': secret
};

interface AnimeFromBackend {
    id: number;
    title: string;
    slug: string;
    description: string;
    image: string;
    created_at: string;
    updated_at: string;
    alter_names: string[];
}

test('scrap anime without alter_names from backend, update backend with alter_names', async ({ page }) => {
    const alter_names: string[] = [];
    const fs = await import('fs/promises');
    const path = `results/anime-alter-names.json`;

    const response = await fetch(`${webhook}/animes/without-alternames`);
    if (!response.ok) {
        console.error(`No se pudo obtener el anime: ${response.status}`);
        return;
    }
    const anime: AnimeFromBackend = await response.json();

    const searchUrl = `https://www3.animeflv.net/browse?q=${encodeURIComponent(anime.title)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    const firstResultLink = page.locator("//ul[contains(@class,'ListAnimes')]/li[1]//a");
    if (await firstResultLink.count() === 0) {
        console.error(`No se encontró resultado para "${anime.title}"`);
        
        alter_names.push("AnimeBell");
        const payload = {
            id: anime.id,
            alter_names
        };
        await fs.writeFile(path, JSON.stringify(payload, null, 2), 'utf-8');

        if (!webhook || !secret) {
            console.error("SERVER_API o SERVER_SECRET no están definidos en el entorno.");
            return;
        }
        await SendJsonToWebHook(
            webhook + "/webhook/update-anime-alternames",
            path,
            headers
        );
        return;
    }
    const animeHref = await firstResultLink.first().getAttribute("href");
    if (!animeHref) {
        console.error(`No se pudo obtener el enlace del primer resultado para "${anime.title}"`);
        return;
    }

    const animeUrl = `https://www3.animeflv.net${animeHref}`;
    await page.goto(animeUrl, { waitUntil: 'domcontentloaded' });

    const specificAnime = new SpecificAnime(page, animeUrl);
    const alterNameLocators = page.locator(specificAnime.getAlterNames);
    const count = await alterNameLocators.count();
    for (let i = 0; i < count; i++) {
        const name = await alterNameLocators.nth(i).innerText();
        if (name) {
            alter_names.push(name.trim());
        }
    }

    if (alter_names.length === 0) {
        //add default alter name
        alter_names.push("AnimeBell");
    }

    const payload = {
        id: anime.id,
        alter_names
    };
    await fs.writeFile(path, JSON.stringify(payload, null, 2), 'utf-8');

    if (!webhook || !secret) {
        console.error("SERVER_API o SERVER_SECRET no están definidos en el entorno.");
        return;
    }
    await SendJsonToWebHook(
        webhook + "/webhook/update-anime-alternames",
        path,
        headers
    );
});