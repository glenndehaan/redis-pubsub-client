/**
 * Import test suite
 */
const should = require('should');

/**
 * Import packages needed for tests
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
 * Define global vars
 */
let redisClient = null;
let exampleChannel = null;

describe("Redis Pub/Sub Client", () => {
    /**
     * Should be able to create a Redis client
     */
    it('Should be able to construct without error', (done) => {
        redisClient = new RedisPubSub(config);
        done();
    });

    /**
     * Should be able to connect to a Redis server
     */
    it('Should be able to connect to a Redis server', async () => {
        await redisClient.connect();
    });

    /**
     * Should be able to subscribe to a Redis channel
     */
    it('Should be able to subscribe to a Redis channel', (done) => {
        exampleChannel = redisClient.subscribe('example', () => {}, () => {
            done();
        });
    });

    /**
     * Should be able to unsubscribe from a Redis channel
     */
    it('Should be able to unsubscribe from a Redis channel', (done) => {
        exampleChannel.unsubscribe(() => {
            done();
        })
    });

    /**
     * Should be able to publish a message and receive it from a Redis channel
     */
    it('Should be able to publish a message and receive it from a Redis channel', (done) => {
        exampleChannel = redisClient.subscribe('example', (data) => {
            data.should.be.Object();
            data.test.should.be.String();
            data.test.should.be.equal('OK');
            done();
        }, () => {
            redisClient.publish('example', {
                test: 'OK'
            });
        });
    });

    /**
     * Should be able to disconnect from a Redis server
     */
    it('Should be able to disconnect from a Redis server', (done) => {
        redisClient.disconnect();
        done();
    });

    /**
     * Should be able to catch an error from the Redis server
     */
    it('Should be able to catch an error from the Redis server', (done) => {
        redisClient.error((e) => {
            e.should.Error();
            done();
        });
        redisClient.publish('example', {
            test: 'OK'
        });
    });

    /**
     * Should be able to end the connection with the Redis server
     */
    it('Should be able to end the connection with the Redis server', (done) => {
        redisClient.end();
        done();
    });
});
