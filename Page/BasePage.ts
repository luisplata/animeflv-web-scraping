import {Page} from '@playwright/test';

export class BasePage {
    protected page: Page;
    protected url: string;

    constructor(page: Page, url: string) {
        this.url = url;
        this.page = page;
        //console.log("🔗 Page::", this.url);
    }

    public async init() {
        try {
            await this.page.route('**/*', (route) => {
                if (route.request().resourceType() === 'image') {
                    route.abort();
                } else {
                    route.continue();
                }
            });
            await this.page.goto(this.url, {timeout: 90000, waitUntil: 'domcontentloaded'});
        } catch (error) {
            console.error(`Failed to navigate to ${this.url}:`, error);
        }
    }

    public get getPage(): Page {
        return this.page;
    }
}