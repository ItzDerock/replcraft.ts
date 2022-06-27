import Client from "..";

export type EntityData = {
    type: string;
    name: string;
    health?: number | undefined;
    max_health?: number | undefined;
    player_uuid?: string | undefined;
    x: number;
    y: number;
    z: number;
}

export class Entity {
    type: string;
    name: string;
    health: number | undefined;
    max_health: number | undefined;
    player_uuid: string | undefined;
    x: number;
    y: number;
    z: number;

    constructor(data: EntityData, private readonly client: Client) {
        this.type = data.type;
        this.name = data.name;
        this.health = data.health;
        this.max_health = data.max_health;
        this.player_uuid = data.player_uuid;
        this.x = data.x;
        this.y = data.y;
        this.z = data.z;
    }
}