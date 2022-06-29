import Client from "..";
import { Block } from "../structures/Block";
import { XYZ } from "../types";

export class BlockManager {
    watching = new Set<XYZ>();
    watchingAll = false;

    polling = new Set<XYZ>();
    pollingAll = false;

    constructor(private readonly client: Client) {}

    /**
     * Retrieves a block at the given structure-local coordinates.
     * @param x the x coordinate of the block
     * @param y the y coordinate of the block
     * @param z the z coordinate of the block
     */
    get(x: number, y: number, z: number): Promise<Block> {
        return this.client.request({ action: 'get_block', x, y, z })
            .then((res: any) => new Block(res.block, this.client, [x, y, z]));
    }

    /** 
     * Sets a block at the given structure-local coordinates. The block must be available
     * in the specified source chest or the structure inventory. Any block replaced by this call
     * is stored in the specified target chest or the structure inventory, or dropped in the
     * world if there's no space.
     * @param x the x coordinate of the block (container relative)
     * @param y the y coordinate of the block (container relative)
     * @param z the z coordinate of the block (container relative)
     * @param blockData the block to set
     * @param source_x the x coordinate of the container to take the block from
     *                           if excluded, uses the structure inventory instead.
     * @param source_y the y coordinate of the container to take the block from
     *                           if excluded, uses the structure inventory instead.
     * @param source_z the z coordinate of the container to take the block from
     *                           if excluded, uses the structure inventory instead.
     * @param target_x the x coordinate of the container to put the drops into
     *                           if excluded, uses the structure inventory instead.
     * @param target_y the y coordinate of the container to put the drops into
     *                           if excluded, uses the structure inventory instead.
     * @param target_z the z coordinate of the container to put the drops into
     *                           if excluded, uses the structure inventory instead.
     * @throws {CraftError}
     */
    set(
        x: number, y: number, z: number,
        blockData: string,
        source_x?: number, source_y?: number, source_z?: number,
        target_x?: number, target_y?: number, target_z?: number
    ) {
        return this.client.request({
            action: 'set_block',
            x, y, z,
            blockData,
            source_x, source_y, source_z,
            target_x, target_y, target_z
        });
    }


    /**
     * Retrieves the text of a sign at the given coordinates.
     * @param x the x coordinate of the sign
     * @param y the y coordinate of the sign
     * @param z the z coordinate of the sign
     */
    readSign(x: number, y: number, z: number): Promise<string[]> {
        return this.client.request({ action: 'get_sign_text', x, y, z })
            .then((res: any) => res.lines);
    }

    /**
     * Sets the text of a sign at the given coordinates.
     * @param x the x coordinate of the sign (container relative)
     * @param y the y coordinate of the sign (container relative)
     * @param z the z coordinate of the sign (container relative)
     * @param lines the text of the sign
     */
    async setSign(x: number, y: number, z: number, lines: string[]) {
        await this.client.request({ action: 'set_sign_text', x, y, z, lines })
    }

    /**
     * Begins watching a block for changes.
     * Note that this isn't perfectly reliable and doesn't catch all possible updates.
     * @param x the x coordinate of the block (container relative)
     * @param y the y coordinate of the block (container relative)
     * @param z the z coordinate of the block (container relative)
     */
    async watch(x: number, y: number, z: number): Promise<this> {
        await this.client.request({ action: 'watch', x, y, z });
        this.watching.add([x, y, z]);
        return this;
    }

    /**
     * Stops watching a block for changes.
     * @param x the x coordinate of the block (container relative)
     * @param y the y coordinate of the block (container relative)
     * @param z the z coordinate of the block (container relative)
     */
    async unwatch(x: number, y: number, z: number): Promise<this> {
        await this.client.request({ action: 'unwatch', x, y, z });
        this.watching.delete([x, y, z]);
        return this;
    }

    /**
     * Begins watching all blocks in the structure for changes.
     * Note that this isn't perfectly reliable and doesn't catch all possible updates.
     */
    async watchAll(): Promise<this> {
        await this.client.request({ action: 'watch_all' });
        this.watchingAll = true;
        return this;
    }

    /**
     * Stops watching all blocks in the structure for changes.
     */
    async unwatchAll(): Promise<this> {
        await this.client.request({ action: 'unwatch_all' });
        this.watchingAll = false;
        return this;
    }

    /**
     * Begins polling a block for updates.
     * Note that this catches all possible updates, but only one block is polled per tick.
     * The more blocks you poll, the slower the individual block will be checked.
     * Additionally, if a block changes multiple times between polls, only the latest change will be reported.
     * @param x the x coordinate of the block (container relative)
     * @param y the y coordinate of the block (container relative)
     * @param z the z coordinate of the block (container relative)
     */
    async poll(x: number, y: number, z: number): Promise<this> {
        await this.client.request({ action: 'poll', x, y, z });
        this.polling.add([x, y, z]);
        return this;
    }

    /**
     * Stops polling a block for updates.
     * @param x the x coordinate of the block (container relative)
     * @param y the y coordinate of the block (container relative)
     * @param z the z coordinate of the block (container relative)
     */
    async unpoll(x: number, y: number, z: number): Promise<this> {
        await this.client.request({ action: 'unpoll', x, y, z });
        this.polling.delete([x, y, z]);
        return this;
    }

    /**
     * Begins polling all blocks in the structure for updates.
     * Updates will be very slow!
     */
    async pollAll(): Promise<this> {
        await this.client.request({ action: 'poll_all' });
        this.pollingAll = true;
        return this;
    }

    /**
     * Stops polling all blocks in the structure for updates.
     */
    async unpollAll(): Promise<this> {
        await this.client.request({ action: 'unpoll_all' });
        this.pollingAll = false;
        return this;
    }

    /**
     * Get a block's redstone power level
     * @param x the x coordinate of the block (container relative)
     * @param y the y coordinate of the block (container relative)
     * @param z the z coordinate of the block (container relative)
     */
    getPowerLevel(x: number, y: number, z: number): Promise<number> {
        return this.client.request({ action: 'get_power_level', x, y, z })
            .then((res: any) => res.power);
    }
    
}