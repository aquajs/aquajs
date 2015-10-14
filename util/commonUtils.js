var uuid = require('uuid'),
    Emailer = require('aquajs-mailer');

module.exports = {
    UUID_TimeBased: function() {
        return uuid.v1();
    },
    UUID_Random: function() {
        return uuid.v4();
    },
    getStackTrace : function (err) {
        return {
            date:    new Date().toString(),
            stack:    err && err.stack && err.stack.split('\n')
        };
    },

    sendEmail : function(config,templateDir,template,templateContext,mailContext) {
        var emailer = new Emailer(config, templateDir);
        emailer.send(template, templateContext, mailContext, function (err, result) {
            if (err) console.error('Message failed to send: ' + err);
        });
    }
};
