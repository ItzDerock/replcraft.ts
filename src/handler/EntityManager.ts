import Client from "..";
import { Entity, EntityData } from "../structures/Entity";

export default class EntityManager {
    constructor(private readonly client: Client) {}

    /**
     * Get all entities in the region.
     */
    getAll(): Promise<Entity[]> {
        return this.client.request({ action: 'get_entities' })
            .then((res: any) => res.entities.map((entityData: EntityData) => new Entity(entityData, this.client)));
    }
}