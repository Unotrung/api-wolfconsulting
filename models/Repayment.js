const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Sử dụng config mongoose ngay trong model khi ta muốn random nhiều dữ liệu ngẫu nhiêu cho model này
// Sử dụng các biến trong file .env
dotenv.config();

// mongoose.connect(process.env.MONGODB_URL, function (err) {
//     if (!err) {
//         console.log('Connect MongoDB Successfully');
//     }
//     else {
//         console.log('Connect MongoDB Failure');
//     }
// }
// )

const repaymentSchema = new mongoose.Schema({
    dueDate: {
        type: Date,
        required: true,
    },
    provider: {
        type: String,
        required: true,
    },
    paidMoney: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
}, { timestamps: true });

// const Repayment = mongoose.model('Repayment', repaymentSchema);
// // Khi vừa khởi tạo model này thì sẽ đồng thời random ra 14 dữ liệu bất kỳ vào trong model luôn
// for (let i = 0; i < 14; i++) {
//     Repayment.create({
//         dueDate: Date.now(),
//         provider: `provider ${i}`,
//         paidMoney: i + 1000,
//         status: 'Đã thanh toán'
//     })
// }

module.exports = mongoose.model('Repayment', repaymentSchema);