// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// const conn = mongoose.createConnection(process.env.MONGODB_URL);

// conn.on('connected', function () {
//     console.log(`MongoDB Is Connected: ${this.name}`);
// });

// conn.on('disconnected', function () {
//     console.log(`MongoDB Is Disconnected: ${this.name}`);
// });

// conn.on('error', function (err) {
//     console.log(`MongoDB Is Error: ${JSON.stringify(error)}`);
// });

// // Khi ta tắt server nó sẽ ngắt kết nối database
// process.on('SIGINT', async () => {
//     await conn.close();
//     process.exit(0);
// })

