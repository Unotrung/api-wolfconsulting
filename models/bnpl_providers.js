const mongoose = require('mongoose');

const bnpl_providerSchema = new mongoose.Schema({

    provider: {
        type: String
    },
    url: {
        type: String
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('bnpl_provider', bnpl_providerSchema);