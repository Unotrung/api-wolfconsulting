const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendMail = async (mail, title, content) => {
    let transporter = nodemailer.createTransport({
        service: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    let mailOptions = {
        from: process.env.MAIL_USERNAME,
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