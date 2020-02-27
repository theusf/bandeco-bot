'use strict';

var app = require("./config/server.js");
var cliente = require("./config/twitter.js"); //Importa o arquivo twitter.js
var CronJob = require('cron').CronJob; //Importa o "node-cron"
var http = require('http');
const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.prefeitura.unicamp.br/apps/site/cardapio.php';

//Configura a porta disponível ou a porta 3000
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
//Configura o host disponível ou "0.0.0.0"
var server_host = process.env.YOUR_HOST || '0.0.0.0';

app.listen(server_port, server_host, function () {
    console.log("Aplicação online.");
});

const getPage = ( cb ) => {
    request(url,  {
        timeout: 3000,
        encoding: "latin1"
    }, (error, response, body) => {
        if(!error) {
            cb(body);
        }
    });
};

const  parsePage = ( data ) => {

    const $ = cheerio.load(data)

    let output = [];

    $('table.fundo_cardapio').each( async (i, elem ) => {
        
       let $titulo = $('p.titulo');
       let $tbody = $(elem).find('tbody');
       let $tr = $($tbody).find('tr');
       let $td = $($tr).find('td');

        $titulo.text();

       const obj = {
        TITULO: $titulo.text(),
        REFEICAO: ''
       }

       $td.each(async (i, elem) => {

            if (elem.children[0].data){
                obj['REFEICAO']+= '\r\n' + elem.children[0].data
            }
            
            if (elem.children[0].tagName == 'strong') {
                let tipo = elem.children[0].children[0].data;

                if (elem.children[0].next.next != null) {
                    if (elem.children[0].next.next.tagName == 'br') 
                        obj[tipo] = elem.children[0].next.next.next.data;;
                }
                else
                    obj[tipo] = elem.children[0].children[0].parent.next.data
            }       
        })


        output.push(obj)

    });
    return output;
};


var job = new CronJob('00 01 9 * * 1-5', function () {
//    Roda todo dia às 0:09:00

getPage( (html) => {
    let data = parsePage(html);

    const emojis = {
        ABACAXI: '🍍',
        MAÇA: '🍎',
        MANGA: '🥭',
        UVA: '🍇',
        TANGERINA: '🍊',
        LARANJA: '🍊',
        LIMÃO: '🍋'
    }

    const titulo = `${data[0]['TITULO']}`

    const titulo_refeicoes = {
        0: 'Almoço 🍽️',
        1: 'Almoço Vegetariano 🥗🍴',
        2: 'Jantar 🍲',
        3: 'Jantar Vegetariano 🥗🍴'
    }

    for (var i = 0; i<4 ; i++ ) {
        const suco =  data[i]['SUCO:'];
        const tweet = `${titulo}\r\n${titulo_refeicoes[i]}\r\n${data[i]['REFEICAO']}\r\n \r\n PRATO PRINCIPAL: ${data[i]['PRATO PRINCIPAL:']}\r\n \r\nSALADA: ${data[i]['SALADA:']}\r\n \r\nSOBREMESA: ${data[i]['SOBREMESA:']}\r\n \r\nSUCO: ${suco} ${(emojis[suco] ? emojis[suco] : '') }`
        console.log(tweet)
        cliente.tweetar(tweet);
    }


});


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

    getPage( (html) => {
        let data = parsePage(html);

        cliente.tweetar(JSON.stringify(data));

    });
});


var keepAwake = new CronJob('0 */25 * * * *', function () {
    //Roda de 25 em 25 minutos para manter o bot acordado

    http.get('https://bandecobot.herokuapp.com')

},
    function () {
        //Função executada quando o job finaliza
        console.log("Mantendo bot acordado")
    },
    true, //Ativa o job
    'America/Sao_Paulo' //Fuso horário.
);



app.get("/", function (req, res) {
    console.log('Fez um get!')

    getPage( (html) => {
        const data = parsePage(html);
        //console.log(data)

        res.send(JSON.stringify(data));

    });
});
