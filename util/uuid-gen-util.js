var uuid = require('uuid');

module.exports = {
    UUID_TimeBased: function() {
        return uuid.v1();
    },
    UUID_Random: function() {
        return uuid.v4();
    }
};
