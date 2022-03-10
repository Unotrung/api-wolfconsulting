// const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Sử dụng config mongoose ngay trong model khi ta muốn random nhiều dữ liệu ngẫu nhiêu cho model này
// Sử dụng các biến trong file .env
// dotenv.config();

// mongoose.connect(process.env.MONGODB_URL, function (err) {
//     if (!err) {
//         console.log('Connect MongoDB Successfully');
//     }
//     else {
//         console.log('Connect MongoDB Failure');
//     }
// }
// )

const transactionSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    product: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
}, { timestamps: true });

// const Transaction = mongoose.model('Transaction', transactionSchema);
// Khi vừa khởi tạo model này thì sẽ đồng thời random ra 20 dữ liệu bất kỳ vào trong model luôn
// for (let i = 0; i < 20; i++) {
//     Transaction.create({
//         provider: `provider ${i}`,
//         date: Date.now(),
//         product: `product ${i}`,
//         price: i + 1000,
//         status: 'Không thành công'
//     })
// }

module.exports = mongoose.model('Transaction', transactionSchema);