import {Actor} from "../../../Actor/Actor";

export class User extends Actor {
    private readonly page: string;

    constructor(name: string, page: string) {
        super(name);
        this.page = page;
    }

    getPage(): string {
        return this.page;
    }
}