const Personal = require('../models/bnpl_personals');
const Customer = require('../models/eap_customers');
const { MSG_GET_INFORMATION_USER_SUCCESS, MSG_GET_INFORMATION_NOT_EXISTS } = require('../config/response/response');

const RelatedBNPLController = {

    verifyEmail: async (email) => {
        let customers = await Customer.find();
        let customer = customers.find(x => x.email === email);
        if (customer !== null) {
            if (customer?.verifyEmail === true) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    },

    verifyPhone: async (phone) => {
        let customers = await Customer.find();
        let customer = customers.find(x => x.phone === phone);
        if (customer !== null) {
            if (customer?.verifyPhone === true) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    },

    getUser: async (req, res, next) => {
        try {
            let phone = req.params.phone;
            let userEAPs = await Customer.find();
            let userBNPLs = await Personal.find();
            let userEAP = userEAPs.find(x => x.phone === phone);
            let userBNPL = userBNPLs.find(x => x.phone === phone);
            if (userBNPL && userEAP) {
                let isVerifyEmail = await RelatedBNPLController.verifyEmail(userEAP.email);
                let isVerifyPhone = await RelatedBNPLController.verifyPhone(userEAP.phone);
                if (isVerifyEmail === false) {
                    return res.status(200).json({
                        message: 'This account has not activated the email',
                        status: false,
                        statusCode: 6001
                    });
                }
                else if (isVerifyPhone === false) {
                    return res.status(200).json({
                        message: 'This account has not activated the phone',
                        status: false,
                        statusCode: 6002
                    });
                }
                else if (isVerifyEmail === true && isVerifyPhone === true) {
                    return res.status(200).json({
                        message: MSG_GET_INFORMATION_USER_SUCCESS,
                        data: userBNPL,
                        status: true
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: MSG_GET_INFORMATION_NOT_EXISTS,
                    status: false,
                    statusCode: 900
                });
            }
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = RelatedBNPLController;