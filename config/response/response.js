const MSG_ENTER_ALL_FIELDS = 'Please enter all fields ! Do not leave any field blank !';
const MSG_GET_LIST_SUCCESSFULLY = 'Get list successfully';
const MSG_GET_LIST_FAILURE = 'Get list failed';
const MSG_LIST_IS_EMPTY = 'List is empty';
const MSG_GET_DETAIL_SUCCESSFULLY = 'Get detail successfully';
const MSG_GET_DETAIL_FAILURE = 'Get detail failed';
const MSG_NOT_FOUND = 'Not found data';
const MSG_GET_INFORMATION_USER_SUCCESS = 'Get user information successfully';
const MSG_GET_INFORMATION_NOT_EXISTS = 'Account not exists !';
const MSG_UPDATE_SUCCESSFULLY = 'Update successfully';
const MSG_UPDATE_FAILURE = 'Update failed';
const MSG_SEND_OTP_SUCCESSFULLY = 'Send otp successfully';
const MSG_SEND_OTP_FAILURE = 'Send otp failed';
const MSG_VERIFY_OTP_SUCCESSFULLY = 'Successfully. Valid OTP';
const MSG_VERIFY_OTP_FAILURE = 'Failure. Invalid OTP';
const MSG_PHONE_EXISTS = 'Phone Number already exists';
const MSG_MAIL_EXISTS = 'Email already exists';
const MSG_ACCOUNT_EXISTS = 'This account already exists';
const MSG_SYSTEM_TITLE_OTP = 'Get OTP from VOOLO System';
const MSG_VERIFY_OTP_FAILURE_5_TIMES = 'Incorrect OTP 5 times. Please wait 24 hours to try again !';
const MSG_EXPIRE_OTP = 'Expired OTP';
const MSG_REGISTER_SUCCESSFULLY = 'Register successfully';
const MSG_REGISTER_FAILURE = 'Register failed';
const MSG_DEACTIVE_ACCOUNT = 'This phone/email is deactivated by admin';
const MSG_WRONG_EMAIL_PHONE = 'Invalid Phone/Email';
const MSG_WRONG_PASSWORD = 'Wrong Password';
const MSG_LOGIN_FAILURE_5_TIMES = 'Failed logined in 5 times. Please wait 24 hours to try again !';
const MSG_LOGIN_SUCCESSFULLY = 'Login successfully';
const MSG_LOGIN_FAILURE = 'Login failed';
const MSG_LOGOUT_SUCCESSFULLY = 'Log out successfully';
const MSG_LOGOUT_FAILURE = 'Log out failed';
const MSG_ACCOUNT_NOT_EXISTS_REGISTER = 'This account not exists';
const MSG_EMAIL_IS_EXISTS = 'This email exists';
const MSG_PHONE_IS_EXISTS = 'This phone exists';
const MSG_INCORRECT_OLD_PASSWORD = 'Old password is incorrect';
const MSG_OLD_PASSWORD_AND_NEW_PASSWORD_MUST_NOT_BE_THE_SAME = 'Old password and new password must not be the same';
const MSG_GET_REFRESH_TOKEN_SUCCESSFULLY = 'Get refresh token successfully';
const MSG_TOKEN_IS_NOT_VALID = {
    message: 'Token is not valid',
    statusCode: 4003
};
const MSG_YOU_ARE_NOT_AUTHENTICATED = {
    message: 'You are not authenticated',
    statusCode: 4001
};
const MSG_YOU_ARE_NOT_ALLOWED_TO_DO_THIS_ACTION = {
    message: 'You are not allowed to do this action',
    statusCode: 4004
};
const MSG_YOU_DO_NOT_HAVE_PERMISSION_TO_ACCESS_THIS_APP = {
    message: 'You do not have permission to access this app',
    statusCode: 9000
};
const MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_EMAIL = {
    message: 'This account has not activated the email',
    status: false,
    statusCode: 6001
};
const MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_PHONE = {
    message: 'This account has not activated the phone',
    status: false,
    statusCode: 6002
};

module.exports = {
    MSG_ENTER_ALL_FIELDS, MSG_GET_LIST_SUCCESSFULLY, MSG_GET_LIST_FAILURE, MSG_LIST_IS_EMPTY, MSG_GET_DETAIL_SUCCESSFULLY,
    MSG_GET_DETAIL_FAILURE, MSG_NOT_FOUND, MSG_EMAIL_IS_EXISTS, MSG_ACCOUNT_NOT_EXISTS_REGISTER, MSG_LOGOUT_FAILURE,
    MSG_LOGOUT_SUCCESSFULLY, MSG_LOGIN_FAILURE, MSG_LOGIN_SUCCESSFULLY, MSG_LOGIN_FAILURE_5_TIMES, MSG_WRONG_PASSWORD,
    MSG_WRONG_EMAIL_PHONE, MSG_DEACTIVE_ACCOUNT, MSG_REGISTER_FAILURE, MSG_GET_INFORMATION_USER_SUCCESS, MSG_GET_INFORMATION_NOT_EXISTS,
    MSG_UPDATE_SUCCESSFULLY, MSG_UPDATE_FAILURE, MSG_SEND_OTP_SUCCESSFULLY, MSG_SEND_OTP_FAILURE, MSG_VERIFY_OTP_SUCCESSFULLY,
    MSG_REGISTER_SUCCESSFULLY, MSG_EXPIRE_OTP, MSG_VERIFY_OTP_FAILURE_5_TIMES, MSG_SYSTEM_TITLE_OTP, MSG_ACCOUNT_EXISTS,
    MSG_MAIL_EXISTS, MSG_PHONE_EXISTS, MSG_VERIFY_OTP_FAILURE, MSG_PHONE_IS_EXISTS, MSG_TOKEN_IS_NOT_VALID,
    MSG_YOU_ARE_NOT_AUTHENTICATED, MSG_YOU_ARE_NOT_ALLOWED_TO_DO_THIS_ACTION, MSG_YOU_DO_NOT_HAVE_PERMISSION_TO_ACCESS_THIS_APP, MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_EMAIL, MSG_THIS_ACCOUNT_HAS_NOT_ACTIVATED_THE_PHONE,
    MSG_INCORRECT_OLD_PASSWORD, MSG_OLD_PASSWORD_AND_NEW_PASSWORD_MUST_NOT_BE_THE_SAME, MSG_GET_REFRESH_TOKEN_SUCCESSFULLY
}


