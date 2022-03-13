const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');

// '../Logs', 'logs.log': Đi ra khỏi folder helpers vào folder Logs và tạo ra 1 file logs.log
const fileName = path.join(__dirname, '../Logs', 'logs.log');

const logEvents = async (message) => {
    const dateTime = `${format(new Date(), 'dd-MM-yyyy\tHH::mm::ss')}`;
    const contentLog = `${dateTime}-----${message}\n`;
    try {
        // Store the file where and what content to store
        fs.appendFile(fileName, contentLog);
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = logEvents;