import Client from "..";
import { XYZ } from "../types";

/**
 * A class to represent a block in the world.
 * @class Block
 */
export class Block {
    /* The block type (minecraft:chest, etc) */
    type: string;

    /**
     * The tags of the block.  
     * Examples: 
     *  - `{ facing: "north", type: "single", waterlogged: false }`
     *  - `{ east: "side", north: "none", power: 5, south: "up", west: "none" }`
     */
    tags: {
        [key: string]: string | boolean | number;
    } = {};

    constructor(public readonly _data: string, private readonly client: Client, public readonly location: XYZ) {
        // if no tags ([]) then set only the type
        if (!_data.includes('[')) {
            this.type = _data;
            return;
        };

        // get the type
        this.type = _data.split('[')[0];
        
        // parse [key=value,key=value] into tags
        const tags = _data.split('[')[1].split(']')[0].split(',');

        // loop through tags and set them
        for (const tag of tags) {
            const [key, value] = tag.split('=');
            
            // set boolean values to true/false
            if(['true', 'false'].includes(value)) 
                this.tags[key] = value === 'true';
            // set number values to numbers
            else if(!isNaN(parseInt(value))) 
                this.tags[key] = parseInt(value);
            // set string values to strings
            else 
                this.tags[key] = value;
        }
    }

    get watching() {
        return this.client.blocks.watching.has(this.location);
    }

    set watching(value: boolean) {
        value ? this.watch() : this.unwatch();
    }

    watch() {
        return this.client.blocks.watch(...this.location);
    }

    unwatch() {
        return this.client.blocks.unwatch(...this.location);
    }

    get polling() {
        return this.client.blocks.polling.has(this.location);
    }

    set polling(value: boolean) {
        value ? this.poll() : this.unpoll();
    }

    poll() {
        return this.client.blocks.poll(...this.location);
    }

    unpoll() {
        return this.client.blocks.unpoll(...this.location);
    }
}