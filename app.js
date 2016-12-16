var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', [
    function (session) {
        if (session.message.text.indexOf('co2') > -1) {
            getData(function (json) {
                session.send(
                    "Уровень CO₂ *" + json.co2 + "*\n\n" +
                    json.temperature + " °C"
                );
            });
        }
    }
]);

function getData(callback) {
    return http.get(process.env.CO2_ENDPOINT, function (response) {
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            callback(parsed);
        });
    });
};
