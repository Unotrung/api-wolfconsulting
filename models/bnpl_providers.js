const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URL, function (err) {
    if (!err) {
        console.log('Connect MongoDB Successfully');
    }
    else {
        console.log('Connect MongoDB Failure');
    }
}
)

const bnpl_providerSchema = new mongoose.Schema({

    provider: {
        type: String
    },
    url: {
        type: String
    }

}, { timestamps: true });

const bnpl_provider = mongoose.model('bnpl_provider', bnpl_providerSchema);
for (let i = 1; i < 4; i++) {
    bnpl_provider.create({
        provider: `${i}`,
        url: `${i}`
    })
}

// module.exports = mongoose.model('bnpl_provider', bnpl_providerSchema);