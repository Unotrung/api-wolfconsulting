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
const compression = require('compression');
const helmet = require('helmet');
const { incr, expire, ttl } = require('./helpers/limiter');

const authRoute = require('./routers/AuthRouter');
const userRoute = require('./routers/UserRouter');
const transactionRoute = require('./routers/TransactionRouter');
const repaymentRoute = require('./routers/RepaymentRouter');
const commonRoute = require('./routers/CommonRouter');

dotenv.config();

const app = express();

app.use(helmet());

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(morgan('combined'));

mongoose.connect(process.env.MONGODB_URL, function (err) {
    if (!err) {
        console.log('Connect MongoDB Successfully');
    }
    else {
        console.log('Connect MongoDB Failure');
    }
}
)

app.use('/v1/eap/auth', authRoute);
app.use('/v1/eap/user', userRoute);
app.use('/v1/eap/transaction', transactionRoute);
app.use('/v1/eap/repayment', repaymentRoute);
app.use('/v1/eap/common', commonRoute);

// app.get('/api', async (req, res, next) => {
//     try {
//         // GET IP (Chỉ áp dụng trên server) 
//         // Nếu chạy trên localhost thì cả req.headers['x-forwarded-for'] và req.connection.remoteAddress sẽ là undefined
//         // const getIPUser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//         // GET IP (Chỉ áp dụng trên local)
//         const getIPUser = '128.0.0.1';
//         const numberRequest = await incr(getIPUser);
//         let _ttl;
//         if (numberRequest === 1) {
//             // 1 ip máy tính sẽ tồn tại trong 60 giây
//             await expire(getIPUser, 60);
//             _ttl = 60;
//         }
//         else {
//             // Lấy ra thời gian hết hạn còn lại của ip máy tính
//             _ttl = await ttl(getIPUser);
//         }
//         if (numberRequest > 5) {
//             return res.status(503).json({
//                 status: 'error',
//                 message: 'Server is busy',
//                 numberRequest: numberRequest,
//                 ttl: _ttl
//             })
//         }
//         else {
//             res.json({
//                 status: 'success',
//                 data: [
//                     { id: 1, name: 'Liverpool Fc' },
//                     { id: 2, name: 'Chelsea Fc' },
//                 ],
//                 numberRequest: numberRequest,
//                 ttl: _ttl
//             })
//         }
//     }
//     catch (error) {
//         next(error);
//     }
// })

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

