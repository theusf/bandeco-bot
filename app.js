var app = require("./config/server.js");
var cliente = require("./config/twitter.js"); //Importa o arquivo twitter.js


//Configura a porta disponível ou a porta 3000
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
//Configura o host disponível ou "0.0.0.0"
var server_host = process.env.YOUR_HOST || '0.0.0.0';

app.listen(server_port, server_host, function () {
    console.log("Aplicação online.");
});

app.get("/posta", function (req, res) {
    console.log('Fez um get!')

    cliente.tweetar("bom dia vamo acorda     https://twitter.com/i/status/1217102231683653633");
});