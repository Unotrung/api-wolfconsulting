const redis = require('redis');

const client = redis.createClient({
    port: 6379,
    host: '127.0.0.1'
});

client.ping(function (error, pong) {
    if (error) {
        console.log("Error Ping: ", error);
    }
    else {
        console.log(pong);
    }
});

client.on("error", function (error) {
    console.log("Error: ", error);
});

client.on("connect", function (error) {
    if (error) {
        console.log("Error Connect: ", error);
    }
    else {
        console.log("connected");
    }
});

client.on("ready", function (error) {
    if (error) {
        console.log("Error Ready: ", error);
    }
    else {
        console.log("Redis to ready");
    }
});

module.exports = client;