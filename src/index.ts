import EventEmitter from "events";
import { Awaitable, BaseWSResponse, ClientEvents, CraftError, FuelInfo, RetryQueueEntity, TokenConfig, XYZ } from "./types";
import { WebSocket } from "ws";
import { BlockManager } from "./handler/BlockManager";
import EntityManager from "./handler/EntityManager";
import { ItemManager } from "./handler/ItemManager";
import { Block } from "./structures/Block";
import { Transaction, TransactionData } from "./structures/Transaction";
import { PlayerManager } from "./handler/PlayerManager";

type WSResponseHandler = (response: BaseWSResponse) => void;

export type ClientOptions = {
    token?: string;
    retryFuelErrors?: boolean;
    debug?: boolean;
}

export default class Client extends EventEmitter {
    /* Variables */
    ws?: WebSocket;
    #handlers = new Map<string, WSResponseHandler>();
    nonce: number = 0;
    retryFuelErrors: boolean;
    retryQueue: RetryQueueEntity[] = [];
    #token?: string;
    debug: boolean;
    ready: boolean = false;

    constructor(opts: ClientOptions = {}) {
        super();

        // set the retryFuelErrors option
        this.retryFuelErrors = opts.retryFuelErrors ?? false;

        // set the token
        this.#token = opts.token;

        // set the debug option
        this.debug = opts.debug ?? false;

        // start the retry processing loop
        this.__processRetryQueue();
    }

    /* Events */
    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
    public on<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, listener: (...args: any[]) => Awaitable<void>): this;
    public on(event: string, listener: (...args: any[]) => Awaitable<void>) {
        return super.on(event, listener);
    }

    public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
    public once<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, listener: (...args: any[]) => Awaitable<void>): this
    public once(event: string, listener: (...args: any[]) => Awaitable<void>) {
        return super.once(event, listener);
    }

    public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    public emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: unknown[]): boolean;
    public emit(event: string, ...args: any[]) {
        return super.emit(event, ...args);
    }
  
    public off<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
    public off<S extends string | symbol>(
      event: Exclude<S, keyof ClientEvents>,
      listener: (...args: any[]) => Awaitable<void>,
    ): this {
      return super.off(event, listener);
    }
  
    public removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
    public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ClientEvents>): this {
      return super.removeAllListeners(event);
    }

    /* Request Handler */
    async request(args: any) {
        // wait for ws to be ready
        if(!this.ws) await this.__waitForWS();
        if(!this.ws) return Promise.reject(new CraftError("connection closed", "WS is not ready"));

        // wait for ws to be open
        if(!this.ready && args.action !== "authenticate") await this.__waitForWS();

        // generate a nonce to track this request
        let nonce = (this.nonce++).toString();
        let request = { ...args, nonce };

        // send the request
        this.ws.send(JSON.stringify(request));
        this.__debug(`Sent request: ${JSON.stringify(request)}`);

        // wait for the response
        return new Promise((resolve, reject) => {
            this.#handlers.set(nonce, response => {
                // if the response is an error, reject the promise
                if(!response.ok) {
                    // create the error
                    const error = new CraftError(response.error, response.message);

                    // emit the required error events
                    if(response.error === "out of fuel")
                        this.emit("outOfFuel", error);

                    // handle retries
                    if(response.error === "out of fuel" && this.retryFuelErrors) {
                        setTimeout(() => {
                            this.retryQueue.push({ args, resolve, reject });
                            this.emit("__queueFilled");
                        }, 500);
                    } else {
                        // otherwise, reject the promise
                        reject(error);
                    }
                
                    return;
                }

                // otherwise, resolve the promise
                resolve(response);
            });
        });
    }

    /**
     * Disconnects the client from the server. 
     */ 
    disconnect() {
        if(this.ws) this.ws.close();
    }

    /**
     * Log into the server and connect to the websocket.
     */
    login(token?: string) {
        // set the token to the one provided or the one set on the client
        this.#token = token ? token : this.#token;
        
        // verify the token is set
        if(!this.#token) throw new Error("No token provided!");
        
        // if already connected, disconnect
        if(this.ws) this.disconnect();

        // parse the token
        token = this.#token;
        token = token.replace(/\s*(http:\/\/)?\s*/, "");
        token = token.replace(/\s*(https:\/\/)?\s*/, "");

        // get the config
        var config: TokenConfig;

        try {
            config = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        } catch (error) {
            throw new Error("Invalid token format!");
        }

        // verify the config
        if(!config.host) throw new Error("Invalid token format!");

        // and connect
        this.ws = new WebSocket(`ws://${config.host}/gateway`);

        // reset any handlers
        this.#handlers.clear();

        // re-emit the close event
        this.ws.on('close', () => {
            this.emit("close");
            
            // stop any handlers
            for(let [_nonce, handler] of this.#handlers.entries()) {
                handler({ ok: false, error: "connection closed", message: "The connection has been closed." });
            }

            this.#handlers.clear();
            this.ws = undefined;
            this.ready = false;
        });

        // re-emit the error event
        this.ws.on('error', error => {
            this.emit("error", error);
        });

        // handle incoming messages
        this.ws.on('message', message => {
            this.__debug("Received: " + message);

            // parse the message
            const msg = JSON.parse(message.toString());

            // check if the message has a corresponding handler
            if(this.#handlers.has(msg.nonce)) {
                this.#handlers.get(msg.nonce)!(msg);
                this.#handlers.delete(msg.nonce);

                return;
            }

            // check if has a type
            if(msg.type) {
                if(msg.type === "transact") {
                    this.emit("transaction", new Transaction(msg as TransactionData, this));
                    return;
                }

                if(msg.type === "block update") {
                    this.emit("blockUpdate", msg.cause, new Block(msg.block, this, [msg.x, msg.y, msg.z]), msg.x, msg.y, msg.z);
                    return;
                }

                this.__debug(`Unknown message type: ${msg.type}`);
            }

            // or it could be an event
            if(msg.event) {
                if(msg.event === "blockUpdate") {
                    this.emit("blockUpdate", msg.cause, new Block(msg.block, this, [msg.x, msg.y, msg.z]), msg.x, msg.y, msg.z);
                    return;
                }

                this.__debug(`Unknown event: ${msg.event}`);
            }
        });

        // and wait for the connection to be ready
        return new Promise<void>((resolve, reject) => {
            this.ws!.once('open', () => {
                this.request({ action: 'authenticate', token })
                    .then(() => {
                        resolve()
                        this.emit('ready');
                        this.ready = true;
                    })
                    .catch(reject);
            });
        });
    }

    /**
     * Retrieves the inner size of the structure
     */
    getSize(): Promise<XYZ> {
        return this.request({ action: 'get_size' })
            .then((res: any) => [res.x, res.y, res.z]);
    }

    /** 
     * Retrieves the world coordinate location of the (0,0,0) inner coordinate
     */
    location(): Promise<XYZ> {
        return this.request({ action: 'get_location' })
            .then((res: any) => [res.x, res.y, res.z]);
    }

    /**
     * Obtains detailed fuel usage info for all connections
     */
    fuelInfo(): Promise<FuelInfo> {
        return this.request({ action: 'fuelinfo' }) as Promise<FuelInfo>;
    }

    blocks   = new BlockManager(this);
    entities = new EntityManager(this);
    items    = new ItemManager(this);
    players  = new PlayerManager(this);

    /* Retry Logic */
    private async __processRetryQueue() {
        while(true) {
            // wait for the queue to fill
            await new Promise(res => this.once("__queueFilled", res));
            
            // process the queue
            while(this.retryQueue.length > 0) {
                let { args, resolve, reject } = this.retryQueue.shift()!;
                this.request(args).then(resolve).catch(reject);
            }
        }
    }

    /* Debugging */
    private __debug(...args: any[]) {
        if(this.debug)
            console.log(`[Replcraft] (debug)`, ...args);
    }

    private __waitForWS() {
        return new Promise<void>(res => this.once('ready', res));
    }
}