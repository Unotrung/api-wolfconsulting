const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
// Routes
const authRoute = require('./routers/AuthRouter');
const userRoute = require('./routers/UserRouter');

// Sử dụng các biến trong file .env
dotenv.config();

const app = express();

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})

