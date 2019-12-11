/**
 * Import vendor modules
 */
const redis = require('redis');

/**
 * @class RedisPubSub
 */
class RedisPubSub {
    /**
     * Constructor
     *
     * @param {Object} options Provides the RedisPubSub configuration
     */
    constructor(options = {}) {
        this.emitter = null;
        this.receiver = null;

        this._config = options;
        this._prefix = options.scope ? `${options.scope}:` : '';
        this._errorHandler = null;
    }

    /**
     * Setup a redis client
     *
     * @param {Object} options Provides the connection details
     * @return {RedisClient}
     * @private
     */
    _initClient(options) {
        const auth = options.auth;
        const redisUrl = options.url;
        let client;

        options.port = options.port || 6379;
        options.host = options.host || '127.0.0.1';

        if (!redisUrl) {
            client = redis.createClient(options);
        } else {
            client = redis.createClient(redisUrl, options);
        }

        if (auth) {
            client.auth(auth);
        }

        return client;
    }

    /**
     * Connects to the redis server and setup the clients
     *
     * @return {Promise}
     */
    connect() {
        return new Promise((resolve) => {
            this.ready = {
                emitter: false,
                receiver: false
            };

            // Creates two Redis clients as one cannot be both in receiver and emitter mode
            this.emitter = this._initClient(this._config);
            this.receiver = this._initClient(this._config);
            this.receiver.setMaxListeners(0);

            this.emitter.on("ready", () => {
                this.ready.emitter = true;

                if (this.ready.emitter && this.ready.receiver) {
                    resolve();
                }
            });
            this.receiver.on("ready", () => {
                this.ready.receiver = true;

                if (this.ready.emitter && this.ready.receiver) {
                    resolve();
                }
            });

            this.emitter.on("warning", (e) => {
                console.log('[REDIS] Warning: ', e);
            });
            this.receiver.on("warning", (e) => {
                console.log('[REDIS] Warning: ', e);
            });
        })
    }

    /**
     * Subscribes to a channel on the redis Pub/Sub
     *
     * @param {String} channel The channel to subscribe to within the redis connection
     * @param {Function} handler The handler function
     * @param {Function} callback Callback that triggers when subscribe has completed
     * @return {Object}
     */
    subscribe(channel, handler, callback = () => {}) {
        const pmessageHandler = (pattern, _channel, message) => {
            if (`${this._prefix}${channel}` === pattern) {
                let jsonmsg = message;

                try {
                    jsonmsg = JSON.parse(message);
                } catch (ex) {
                    if (typeof this._errorHandler === 'function') {
                        return this._errorHandler(`Invalid JSON received! Channel: ${this._prefix}${channel} Message: ${message}`);
                    }
                }

                return handler(jsonmsg, _channel);
            }
        };

        this.receiver.on('pmessage', pmessageHandler);
        this.receiver.psubscribe(`${this._prefix}${channel}`, callback);

        return {
            channel,
            unsubscribe: (callback = () => {}) => {
                this.receiver.removeListener('pmessage', pmessageHandler);
                return this.receiver.punsubscribe(`${this._prefix}${channel}`, callback);
            }
        };
    }

    /**
     * Publishes data to a channel on the redis Pub/Sub
     *
     * @param {String} channel The channel used to send the message
     * @param {Object|String|*} message The message itself
     * @return {*}
     */
    publish(channel, message) {
        return this.emitter.publish(`${this._prefix}${channel}`, JSON.stringify(message));
    }

    /**
     * Subscribe to redis errors
     *
     * @param {Function} handler Error function handler
     */
    error(handler) {
        this._errorHandler = handler;
        this.emitter.on("error", handler);
        this.receiver.on("error", handler);
    }

    /**
     * Safely close the redis connection (Waits until all messages are send)
     */
    disconnect() {
        this.emitter.quit();
        this.receiver.quit();
    }

    /**
     * Exit redis now (Messages awaiting will be discarded)
     */
    end() {
        this.emitter.end(true);
        this.receiver.end(true);
    }
}

/**
 * Export the RedisPubSub Client
 *
 * @type {RedisPubSub}
 */
module.exports = RedisPubSub;
