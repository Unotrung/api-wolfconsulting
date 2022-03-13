// Kiểm tra máy tính của chúng ta có bao nhiêu luồng
// -----------------------------------------------------------------------
// const os = require('os');
// // Print out the number of threads (cores) that our machine has
// console.log('Length Thread: ', os.cpus().length);
// -----------------------------------------------------------------------

// Khởi tạo 2 key là JWT_ACCESS_KEY và JWT_REFRESH_KEY
// -----------------------------------------------------------------------
// const crypto = require('crypto');
// const JWT_ACCESS_KEY = crypto.randomBytes(32).toString('hex');
// const JWT_REFRESH_KEY = crypto.randomBytes(32).toString('hex');
// console.table({ JWT_ACCESS_KEY, JWT_REFRESH_KEY })
// -----------------------------------------------------------------------

// Test tăng tốc ỨNG DỤNG NODE.JS lên x3 với ThreadPool
// -----------------------------------------------------------------------
// app.get('/', async (req, res) => {
//     const password = await bcrypt.hash('This is a password', 10);
//     return res.send(password.repeat(1000)); // Lặp lại password 1000 lần
// })
// Vào file .env đặt UV_THREADPOOL_SIZE=số core ta muốn (Số core càng cao chạy càng nhanh)
// -----------------------------------------------------------------------

