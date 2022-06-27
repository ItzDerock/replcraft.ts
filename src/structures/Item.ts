export type ItemData = {
    index: number;
    type: string;
    amount: number;
}

export class Item {
    index: number;
    type: string;
    amount: number;

    constructor(data: ItemData) {
        this.index = data.index;
        this.type = data.type;
        this.amount = data.amount;
    }
}

export type ItemReference = {
    /** the container slot this item is in */
    index: number;
    /** the x coordinate of the container this item is in */
    x: number;
    /** the y coordinate of the container this item is in */
    y: number;
    /** the z coordinate of the container this item is in */
    z: number;
}