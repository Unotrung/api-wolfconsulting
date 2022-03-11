const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
// Routes
const authRoute = require('./routers/AuthRouter');
const userRoute = require('./routers/UserRouter');
const transactionRoute = require('./routers/TransactionRouter');
const repaymentRoute = require('./routers/RepaymentRouter');

// Sử dụng các biến trong file .env
dotenv.config();

const app = express();

// Khi người dùng truy xuất đến đường dẫn public, thì chúng ta sẽ được server đưa đến folder public. Lúc này người dùng có thể sử dụng các file, folder con
// trong thư mục public đã được công khai này. Chỉ những folder nào được static thì người dùng mới có thể truy cập trực tiếp
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use(cors());
app.use(cookieParser());
app.use(express.json());

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

// Setup body-parser 
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));

// ROUTES
app.use('/v1/auth', authRoute);
app.use('/v1/user', userRoute);
app.use('/v1/transaction', transactionRoute);
app.use('/v1/repayment', repaymentRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})

