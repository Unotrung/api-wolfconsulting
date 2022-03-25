// const client = require('../database/connections_redis');

// //  How to limit Requests N times every X minutes (The key here will be the id of the computer)
// const incr = (key) => {
//     return new Promise((resolve, reject) => {
//         // Increase by 1 unit each time
//         client.incr(key, (err, result) => {
//             if (err) {
//                 return reject(err);
//             }
//             else {
//                 resolve(result);
//             }
//         })
//     })
// }

// // After how many seconds will it expire, remove the ip in blacklist
// const expire = (key, ttl) => {
//     return new Promise((resolve, reject) => {
//         // Increase by 1 unit each time
//         client.expire(key, ttl, (err, result) => {
//             if (err) {
//                 return reject(err);
//             }
//             else {
//                 resolve(result);
//             }
//         })
//     })
// }

// // Check the life time of ttl
// const ttl = (key) => {
//     return new Promise((resolve, reject) => {
//         // Increase by 1 unit each time
//         client.ttl(key, (err, ttl) => {
//             if (err) {
//                 return reject(err);
//             }
//             else {
//                 resolve(ttl);
//             }
//         })
//     })
// }

// module.exports = { incr, expire, ttl }