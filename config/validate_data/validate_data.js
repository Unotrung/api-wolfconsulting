const VALIDATE_PHONE = /^(09|03|07|08|05)+([0-9]{8}$)/;
const VALIDATE_PASSWORD = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&~^\-+_\(\)]{6,}$/;

module.exports = { VALIDATE_PHONE, VALIDATE_PASSWORD }