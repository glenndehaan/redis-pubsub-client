# Redis Pub/Sub Client

A way to define which browsers are supported in your express app

[![npm](https://img.shields.io/npm/v/redis-pubsub-client.svg)](https://www.npmjs.com/package/redis-pubsub-client) ![node](https://img.shields.io/node/v/redis-pubsub-client.svg) ![dependencies](https://david-dm.org/glenndehaan/redis-pubsub-client.svg) [![Build Status](https://travis-ci.org/glenndehaan/redis-pubsub-client.svg?branch=master)](https://travis-ci.org/glenndehaan/redis-pubsub-client) [![Coverage Status](https://coveralls.io/repos/github/glenndehaan/redis-pubsub-client/badge.svg?branch=master)](https://coveralls.io/github/glenndehaan/redis-pubsub-client?branch=master)

## Functionalities
* Provides a simple layer between the official redis client and the redis pub/sub functionality

## Setup
Install the Redis Pub/Sub client:
```
npm install redis-pubsub-client
```
Require the Redis Pub/Sub client somewhere in your code:
```
const RedisPubSub = require('redis-pubsub-client');
```

## Usage
Start by defining a redis config:
```
const config = {
    host: '127.0.0.1' // Redis server hostname/ip (optional)
    port: 32768, // Redis server port (optional)
    scope: 'test' // Global message scope (optional)
};
```

Now construct a new RedisClient like so:
```
const redisClient = new RedisPubSub(config);
```

Connect to the redis server:
```
const waitForRedis = async () => {
    await redisClient.connect();
    console.log('server ready');
};

waitForRedis();
```

You are now ready to subscribe to channels and publish messages!

## Subscribe
How to subscribe to a channel?:
```
// Returns the unsubscribe function along the current subscribed channel
const exampleChannel = redisClient.subscribe('example', (data) => {
    console.log(data);
});
```

## Publish
How to send a message to a channel?:
```
// Returns true/false based on the fact if the message was recieved by the server
const messageStatus = redisClient.publish('example', {
    message: 'Hello World'
});
```

## Catch Errors
To catch all Redis server errors use the following function:
```
redisClient.error((e) => {
    console.log(e);
});
```

## Disconnect
To cleanly disconnect from the Redis server use this function:
```
redisClient.disconnect();
```

## Force Quit
If you need to exit immediately you can also use this function (This is not recommended since this will discard messages that are still in sending state)
```
redisClient.end();
```

## License

MIT
