/**
 * Import packages
 */
const RedisPubSub = require('../src');

/**
 * Setup Redis config
 *
 * @type {{scope: string}}
 */
const config = {
    scope: 'test'
};

/**
 * Create Redis Client
 *
 * @type {RedisPubSub}
 */
const redisClient = new RedisPubSub(config);
console.log('redisClient', redisClient);

/**
 * Fixed time display
 *
 * @param time
 * @return {string}
 */
const fixTime = (time) => {
    return time < 10 ? `0${time}` : time
};

/**
 * Sends a redis message
 */
const sendMessage = () => {
    const date = new Date();
    console.log(`Sending message     (${fixTime(date.getHours())}:${fixTime(date.getMinutes())}:${fixTime(date.getSeconds())}:${date.getMilliseconds()})`);
    const test = redisClient.publish('example', {
        message: 'Hello World'
    });

    console.log('test', test);
};

/**
 * Runs the server
 *
 * @return {Promise<void>}
 */
const run = async () => {
    /**
     * Connect to the Redis Server
     */
    await redisClient.connect();

    console.log('server ready');

    /**
     * Listen to redis channel
     */
    const exampleChannel = redisClient.subscribe('example', (data) => {
        const date = new Date();
        console.log(`Message from server (${fixTime(date.getHours())}:${fixTime(date.getMinutes())}:${fixTime(date.getSeconds())}:${date.getMilliseconds()}): ${JSON.stringify(data)}`);
    });

    /**
     * Send a redis message
     */
    setInterval(sendMessage, 2500);
    sendMessage();

    /**
     * Unsubscribe from redis channel
     */
    setTimeout(() => {
        console.log('unsubscribe');
        exampleChannel.unsubscribe();
    }, 5000);
};

run();
