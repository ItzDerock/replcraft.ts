import ReplClient from "../src/index";

const client = new ReplClient({
    token: process.env.TOKEN,
    debug: process.env.DEBUG === 'true'
});

// watch all blocks
client.blocks.watchAll().then(() => console.log('watched'));
client.on('blockUpdate', (action, block) => {
    console.log(`Block (${block.type}) at ${block.location.join(',')} updated: ${action}.`);
    console.log(`Block tags:`, block.tags);
});

// get entities
client.entities.getAll()
    .then((entities) => {
        for(const entity of entities) {
            console.log(`Found entity ${entity.name} with uuid ${entity.player_uuid ?? 'nothing'} and has ${entity.health ?? 'no'} health.`);
        }
    });

// transactions
client.on('transaction', (transaction) => {
    console.log(`${transaction.player.username} (${transaction.player.uuid}) has opened a transaction with query ${transaction.query} and amount of ${transaction.amount}`);

    // tell a user
    transaction.player.message(`Hello world!`);

    // accept the transaction
    transaction.accept();
});

// log in
client.login().then(() => console.log('connected'));