const LOCK_TIME_OTP_FAILURE = Date.now() + 1 * 60 * 60 * 1000;
const LOCK_TIME_LOGIN_FAILURE = Date.now() + 1 * 60 * 60 * 1000;

module.exports = {
    LOCK_TIME_OTP_FAILURE, LOCK_TIME_LOGIN_FAILURE
}