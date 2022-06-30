import { EventEmitter } from "node:events";
import Client from "..";

export default class StructureContext extends EventEmitter {
    constructor(public readonly client: Client, public readonly id: number) {
        super();
    }
}