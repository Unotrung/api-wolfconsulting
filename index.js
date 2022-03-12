const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoute = require('./routers/AuthRouter');
const userRoute = require('./routers/UserRouter');
const transactionRoute = require('./routers/TransactionRouter');
const repaymentRoute = require('./routers/RepaymentRouter');

// Sử dụng các biến trong file .env
dotenv.config();

const app = express();

// Lưu ý: Code nodejs chạy từ trên xuống nên ta cần lưu ý thứ tự đặt

// Khi người dùng truy xuất đến đường dẫn public, thì chúng ta sẽ được server đưa đến folder public. Lúc này người dùng có thể sử dụng các file, folder con
// trong thư mục public đã được công khai này. Chỉ những folder nào được static thì người dùng mới có thể truy cập trực tiếp
app.use(express.static(path.join(__dirname, 'public')));

//  app.use() chính là middleware

app.use(cors());
app.use(cookieParser());
// Xử lý dữ liệu từ form submit lên
app.use(express.urlencoded({ extended: true }));
// Xử lý dữ liệu từ client lên server (XNLHttpRequest, fetch, axios, ajax...)
app.use(express.json());
// HTTP logger (morgan): Chức năng: Khi ta request để biết nó đã được gửi lên server hay chưa thì ở terminal sẽ hiển thị ra thông báo 
app.use(morgan('combined'));

// Để sử dụng 1 middleware ở level của app thì ta sử dụng app.use(). Ta sẽ tự tạo 1 middleware cho riêng chúng ta
// app.use((req, res, next) => {
//     // Trong trường hợp code của chúng ta hợp lệ, không lỗi thì ta sẽ next() có nghĩa là thực hiện tiếp các đoạn code bên dưới nó
//     console.log('>>> Run into my middleware');
//     console.log(req);
//     next();
// })

// Setup Mongoose
mongoose.connect(process.env.MONGODB_URL, function (err) {
    if (!err) {
        console.log('Connect MongoDB Successfully');
    }
    else {
        console.log('Connect MongoDB Failure');
    }
}
)

app.use('/v1/auth', authRoute);
app.use('/v1/user', userRoute);
app.use('/v1/transaction', transactionRoute);
app.use('/v1/repayment', repaymentRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})

