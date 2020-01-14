var app = require("./config/server.js");
var cliente = require("./config/twitter.js"); //Importa o arquivo twitter.js
var CronJob = require('cron').CronJob; //Importa o "node-cron"


//Configura a porta disponível ou a porta 3000
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
//Configura o host disponível ou "0.0.0.0"
var server_host = process.env.YOUR_HOST || '0.0.0.0';

app.listen(server_port, server_host, function () {
    console.log("Aplicação online.");
});

var job = new CronJob('00 10 08 * * 1-7', function () {
    //Roda todo dia às 0:10:00

    cliente.tweetar("bom dia vamo acorda     https://twitter.com/i/status/1217102231683653633");

},
    function () {
        //Função executada quando o job finaliza
        console.log("Cron job stopped!")
    },
    true, //Ativa o job
    'America/Sao_Paulo' //Fuso horário.
);


app.get("/posta", function (req, res) {
    console.log('Fez um get!')

    cliente.tweetar("bom dia vamo acorda     https://twitter.com/i/status/1217102231683653633");

});

app.get("/", function (req, res) {
    console.log('Estamos online')


});