import Client from "..";
import { Player } from "./Player";

export type TransactionData = {
    /** the text used in the /transact command, excluding the initial amount */
    query: string;
    /** The amount of money being offered in the transaction */
    amount: number;
    /** the username of the player using the /transact command */
    player: string;
    /** the uuid of the player using the /transact command */
    player_uuid: string;
    /** the nonce */
    queryNonce: string;
}

export class Transaction {
    /** the text used in the /transact command, excluding the initial amount */
    query: string;
    /** The amount of money being offered in the transaction */
    amount: number;
    player: Player;
    /** the nonce */
    nonce: string;

    constructor(data: TransactionData, private readonly client: Client) {
        this.query = data.query;
        this.amount = data.amount;
        this.player = new Player(data.player, data.player_uuid, this.client)
        this.nonce = data.queryNonce;
    }

    accept() {
        return this.client.request({
            action: "respond",
            queryNonce: this.nonce,
            accept: true
        });
    }

    deny() {
        return this.client.request({
            action: "respond",
            queryNonce: this.nonce,
            accept: false
        });
    }
}