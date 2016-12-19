const restify = require('restify');
const builder = require('botbuilder');
const http = require('http');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        if (checkCommandContains(session.message.text)) {
            getData(
                (json) => session.send(buildResultMessage(json)),
                (error) => session.send(`${error}`)
            );
        }
    }
]);

/**
 * Build response message that will be send to user
 * @param json data received from aggregation server
 * @returns {string} response message
 */
function buildResultMessage(json) {
    const co2 = parseInt(json.co2);
    const temperature = parseFloat(json.temperature);

    let message = '';

    if (co2) {
        message += `**${json.co2}** ppm CO₂\n\n`;

        if (co2 <= 450) {
            message += '**Идеальный уровень для здоровья человека.** _Нормальный уровень на открытом воздухе._';
        } else if (co2 <= 600) {
            message += '**Высокое качество воздуха.** _Отличное самочувствие и бодрость._';
        } else if (co2 <= 800) {
            message += '**Нормальное качество воздуха.** _Возможны жалобы на несвежий воздух._';
        } else if (co2 <= 1000) {
            message += '**Среднее качество воздуха.** _Максимальный уровень стандартов ASHRAE и OSHA 1000 ppm._';
        } else if (co2 <= 1200) {
            message += '**Нижняя граница допустимой нормы.** _Вялость, проблемы с внимательностью и обработкой информации, тяжелое дыхание, проблемы с носоглоткой._';
        } else if (co2 <= 1400) {
            message += '**Низкое качество воздуха.** _Общий дискомфорт, слабость, головная боль, проблемы с концентрацией внимания. Растет число ошибок в работе. Начинаются негативные изменения в ДНК._'
        } else {
            message += '**Крайне низкое качество воздуха.** _Сильная усталость, безынициативность, неспособность сосредоточиться, сухость слизистых, проблемы со сном._'
        }
        message += "\n\n----------------------------------\n\n\n";
    }

    if (temperature) {
        message += `${Math.round(temperature)} °C`;
    }

    return message;
}

/**
 * Check received message for contains special command supported by bot
 * @param message received by bot message
 * @returns {boolean} contains or not special command
 */
function checkCommandContains(message) {
    return new RegExp('co2|со2|сщ2|cj2|co@|со"|oc2').test(message.toLowerCase());
}

/**
 * Get actual data from aggregating server
 * @param successCallback function with one json-param
 * @param errorCallback finction with one string-param
 */
function getData(successCallback, errorCallback) {
    return http.get(process.env.CO2_ENDPOINT, (response) => {
        const statusCode = response.statusCode;
        const contentType = response.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error(`Request Failed. Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type. Expected application/json but received ${contentType}`);
        }
        if (error) {
            errorCallback(error);
            // consume response data to free up memory
            response.resume();
            return;
        }

        response.setEncoding('utf8');
        let rawData = '';
        response.on('data', (chunk) => rawData += chunk);
        response.on('end', () => {
            try {
                let parsedData = JSON.parse(rawData);
                successCallback(parsedData);
            } catch (e) {
                errorCallback(e.message);
            }
        });
    }).on('error', (e) => {
        errorCallback(`Got error: ${e.message}`);
    });
};