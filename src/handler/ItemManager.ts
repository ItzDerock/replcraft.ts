import Client from "..";
import { Item, ItemData } from "../structures/Item";

export class ItemManager {
    constructor(private readonly client: Client) {}


    /**
     * Get all items from a container such as a chest or hopper
     * @param x the x coordinate of the container (container relative)
     * @param y the y coordinate of the container (container relative)
     * @param z the z coordinate of the container (container relative)
     */
    getInventory(x: number, y: number, z: number): Promise<Item[]> {
        return this.client.request({ action: 'get_inventory', x, y, z })
            .then((res: any) => res.items.map((itemData: ItemData) => new Item(itemData)));
    }

    /**
     * Moves an item between containers
     * @param index the item index in the source container
     * @param source_x the x coordinate of the source container (container relative)
     * @param source_y the y coordinate of the source container (container relative)
     * @param source_z the z coordinate of the source container (container relative)
     * @param target_x the x coordinate of the target container (container relative)
     * @param target_y the y coordinate of the target container (container relative)
     * @param target_z the z coordinate of the target container (container relative)
     */
    async moveItem(
        index: number,
        source_x: number, source_y: number, source_z: number,
        target_x: number, target_y: number, target_z: number
    ): Promise<this> {
        await this.client.request({
            action: 'move_item',
            index,
            source_x, source_y, source_z,
            target_x, target_y, target_z
        });

        return this;
    }

    /**
     * Crafts an item, which is then stored into the given container.
     * @param x the x coordinate of the container (container relative)
     * @param y the y coordinate of the container (container relative)
     * @param z the z coordinate of the container (container relative)
     * @param ingredients the ingredients to craft
     */
    async craft(x: number, y: number, z: number, ingredients: ItemData[]): Promise<this> {
        await this.client.request({ action: 'craft', x, y, z, ingredients });
        return this;
    }
}