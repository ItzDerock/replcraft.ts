import { Block } from "./structures/Block";
import { Transaction } from "./structures/Transaction";

export type CraftErrorType = "connection closed" | "unauthenticated" | "invalid operation" | "bad request" | "out of fuel" | "offline";

export class CraftError extends Error {
    type: CraftErrorType;

    constructor(type: CraftErrorType, message: string) {
        super(message);
        this.type = type;
    }
}

/** A tuple of x, y, z coordinates */
export type XYZ = [x: number, y: number, z: number];

/**
 * The cause of the update. One of: "poll" "burn" "break" "explode"
 *   "fade" "grow" "ignite" "piston_extend" "piston_retract" "place"
 *   "fluid" "decay" "redstone"
 */
export type BlockUpdateCause = "poll" | "burn" | "break" | "explode" | "fade" | "grow" | "ignite" | "piston_extend" | "piston_retract" | "place" | "fluid" | "decay" | "redstone";

export interface ClientEvents {
    ready: [];
    close: [];

    error: [error: CraftError | Error];
    blockUpdate: [cause: BlockUpdateCause, block: Block, x: number, y: number, z: number];
    outOfFuel: [error: CraftError];
    transaction: [transaction: Transaction];
}

export type Awaitable<T> = T | PromiseLike<T>;

export type RetryQueueEntity = {
    args: Object;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

export type FuelInfo = {
    /** A list of all active connections for your player to all your structures. */
    connections: FuelInfoConnection[];
    /** A list of strategies and how much fuel they have in reserve. */
    strategies: FuelInfoStrategy[];
    /** A list of apis you can call and their base and adjusted fuel costs */
    apis: { [key: string]: FuelInfoAPICost };
}

export type FuelInfoConnection = {
    /** The minimum x coordinate of the connection's structure */
    x: number;
    /** The minimum y coordinate of the connection's structure */
    y: number;
    /** The minimum z coordinate of the connection's structure */
    z: number;
    /** A textual representation of the structure. The format is not fixed and subject to change. */
    structure: string;
    /** Fuel used by API route */
    fuelUsage: { [key: string]: FuelInfoConnectionFuelUsage };
}

export type FuelInfoConnectionFuelUsage = {
    /** The amount of fuel used in the past second */
    second: number;
    /** The amount of fuel used in the past minute */
    minute: number;
}

export type FuelInfoStrategy = {
    /** the name of the strategy */
    strategy: string;
    /** how much "spare" fuel this strategy has, which will be used before the strategy is activated to generate more. For `ratelimit`, this is always increasing up to a cap. For `item`, this is refilled when an item is burnt. */
    spareFuel: number;
}

export type FuelInfoAPICost = {
    /** How much this API costs normally */
    baseFuelCost: number;
    /** How much this API costs right now */
    fuelCost: number;
}

// WS TYPES

export type BaseWSResponse = {
    ok: false;
    error: CraftErrorType;
    message: string;
} | {
    ok: true;
}

export type TokenConfig = {
    host: string
}