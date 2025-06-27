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

test('scrap anime without genres from backend, update backend with genres', async ({ page }) => {
    const response = await fetch('https://backend.animebell.peryloth.com/api/animes/without-genres');
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
    const genreLocators = page.locator(specificAnime.getGenere);
    const genres: string[] = [];
    const count = await genreLocators.count();
    for (let i = 0; i < count; i++) {
        const genre = await genreLocators.nth(i).innerText();
        if (genre) {
            genres.push(genre.trim());
        }
    }

    const payload = {
        id: anime.id,
        genres: genres
    };

    const fs = await import('fs/promises');
    const path = `results/anime-genres.json`;
    await fs.writeFile(path, JSON.stringify(payload, null, 2), 'utf-8');

    if (!webhook || !secret) {
        console.error("SERVER_API o SERVER_SECRET no están definidos en el entorno.");
        return;
    }
    await SendJsonToWebHook(
        webhook + "/webhook/update-anime-genres",
        path,
        headers
    );
});