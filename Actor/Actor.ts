export class Actor {
    constructor(public name: string) {}

    async attemptsTo(...tasks: Array<() => Promise<void>>) {
        for (const task of tasks) {
            await task();
        }
    }
}
