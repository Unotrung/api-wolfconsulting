const crypto = require('crypto');

const JWT_ACCESS_KEY = crypto.randomBytes(32).toString('hex');
const JWT_REFRESH_KEY = crypto.randomBytes(32).toString('hex');

console.table({ JWT_ACCESS_KEY, JWT_REFRESH_KEY })