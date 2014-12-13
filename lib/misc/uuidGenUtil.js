var uuid = require('node-uuid');

module.exports = {
    genUUID_TimeBased: function() {
        return uuid.v1();
    },
    genUUID_Random: function() {
        return uuid.v4();
    }
};