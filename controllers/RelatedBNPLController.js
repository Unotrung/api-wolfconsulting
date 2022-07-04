const Customer = require('../models/eap_customers');
const Personal = require('../models/bnpl_personals');
const { MSG_GET_INFORMATION_USER_SUCCESS, MSG_GET_INFORMATION_NOT_EXISTS, MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_EMAIL, MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_PHONE }
    = require('../config/response/response');

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
                    return res.status(200).json(MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_EMAIL);
                }
                else if (isVerifyPhone === false) {
                    return res.status(200).json(MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_PHONE);
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