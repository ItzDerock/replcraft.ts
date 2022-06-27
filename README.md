# ReplCraft.TS

ReplCraft.TS is a library to interact with the [Replit mc server](https://mc.repl.game).  
Syntax inspired by discord.js

## Installation
As simple as `npm install --save replcraft.ts`

## Usage
Create a client instance with:
```ts
import ReplClient from "replcraft.ts";
const client = new ReplClient();

client.login(process.env.TOKEN);
```

or without import statements:

```js
const ReplClient = require('replcraft.ts').default;
```

Full documentation can be found in [/docs/classes/Client.md](/docs/classes/Client.md)
See an example at [/examples/test.ts](/examples/test.ts)