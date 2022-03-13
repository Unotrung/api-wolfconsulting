const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const createError = require('http-errors');
const logEvents = require('./helpers/logEvents');
const { v4: uuid } = require('uuid');

const authRoute = require('./routers/AuthRouter');
const userRoute = require('./routers/UserRouter');
const transactionRoute = require('./routers/TransactionRouter');
const repaymentRoute = require('./routers/RepaymentRouter');

dotenv.config();

const app = express();

// Khi người dùng truy xuất đến đường dẫn public, thì chúng ta sẽ được server đưa đến folder public. Lúc này người dùng có thể sử dụng các file, folder con
// trong thư mục public đã được công khai này. Chỉ những folder nào được static thì người dùng mới có thể truy cập trực tiếp
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(cookieParser());

// Chúng ta sẽ đưa các object, array về format chung 1 kiểu là json
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// HTTP logger (morgan): Chức năng: Khi ta request để biết nó đã được gửi lên server hay chưa thì ở terminal sẽ hiển thị ra thông báo 
app.use(morgan('combined'));

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

// Handle Error Not Found
app.use((req, res, next) => {
    // All Not Found errors will be handled centrally here
    next(createError.NotFound('This route dose not exists !'));
})

app.use((err, req, res, next) => {
    // Any middleware that fails will run down to this middleware for processing
    // Log errors in logs.log . file
    logEvents(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${err.message}`);
    return res.json({
        status: err.status || 500,
        message: err.message
    })
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})

