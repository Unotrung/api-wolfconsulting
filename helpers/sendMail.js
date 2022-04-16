const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendMail = async (mail, title, content) => {
    let transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.PASSWORD_EMAIL,
        },
    });

    let mailOptions = {
        from: process.env.USER_EMAIL,
        to: mail,
        subject: `${title}`,
        text: `Hello email: ${mail}`,
        html: `<b>Your OTP is: ${content}</b>`,
    };

    await transporter.sendMail(mailOptions, (err) => {
        if (err) {
            return {
                message: `Fail to send email to ${mail}!`,
                status: false,
                err: err
            };
        }
        else {
            return {
                message: `Success to send email to ${mail}!`,
                status: true,
            };
        }
    });
}

module.exports = sendMail;