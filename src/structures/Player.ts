import Client from "..";

export class Player {
    constructor(public readonly username: string, public readonly uuid: string, private readonly client: Client) {}

    message(message: string) {
        this.client.players.tell(this.uuid, message);
    }
}