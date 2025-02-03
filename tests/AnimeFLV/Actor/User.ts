import { Actor } from "../../../Actor/Actor";

export class User extends Actor {
    private provider: string;
    private page : string;
    constructor(name: string, provider: string, page: string) {
        super(name);
        this.provider = provider;
        this.page = page;
    }

    getProvider(): string {
        return this.provider;
    }

    getPage(): string {
        return this.page;
    }
}