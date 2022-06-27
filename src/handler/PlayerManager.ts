import Client from "..";

export class PlayerManager {
    constructor(private readonly client: Client) {}

    /**
     * Sends a message to a player. The player must be online and inside of the structure.
     * 
     * @param uuid The uuid of the player
     * @param message The message to send to the player 
     */
    async tell(uuid: string, message: string) {
        await this.client.request({
            action: "tell",
            target: uuid,
            message
        });

        return this;
    }

    /**
     * Sends money to a player out of your own account.
     * @param uuid The uuid of the player
     * @param amount The amount of money to send
     */
    async pay(uuid: string, amount: number) {
        await this.client.request({
            action: "pay",
            target: uuid,
            amount
        });

        return this;
    }
}