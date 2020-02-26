'use strict';

var app = require("./config/server.js");
var cliente = require("./config/twitter.js"); //Importa o arquivo twitter.js
var CronJob = require('cron').CronJob; //Importa o "node-cron"
var http = require('http');
const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.prefeitura.unicamp.br/apps/site/cardapio.php';
const fs = require('fs');

//Configura a porta disponível ou a porta 3000
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
//Configura o host disponível ou "0.0.0.0"
var server_host = process.env.YOUR_HOST || '0.0.0.0';

app.listen(server_port, server_host, function () {
    console.log("Aplicação online.");
});


const getPage = ( cb ) => {
    request(url, {
        timeout: 3000
    }, (error, response, body) => {
        if(!error) {
            cb(body);
        }
    });
};

const savePage = ( data ) => {
    let contents = "'use strict';" + '\n\n';
        contents += 'const Cardapio = ';
        contents += JSON.stringify( data ) + ';\n\n';
        contents += 'module.exports = HTMLItArticles;';

        fs.writeFileSync(__dirname + '/articles.js', contents);
};

const  parsePage = ( data ) => {

    const $ = cheerio.load(data)

    let output = [];
    //console.log($.root().html())

    //console.log(cheerio.text($('table.fundo_cardapio', 'tbody')))
    $('table.fundo_cardapio').each( async (i, elem ) => {
        
       let $titulo = $(elem).find('p.titulo');
       let $tbody = $(elem).find('tbody');
       let $tr = $($tbody).find('tr');
       let $td = $($tr).find('td');

       const obj = {
        REFEICAO: ''
       }
       

       $td.each(async (i, elem) => {

            if (elem.children[0].data){
                obj['REFEICAO']+= elem.children[0].data 
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


getPage( (html) => {
    let data = parsePage(html);
    //console.log(data)
    savePage(data);
});


// var job = new CronJob('00 01 10 * * 1-7', function () {
//     //Roda todo dia às 0:10:00

//     cliente.tweetar("bom dia vamo acorda     https://twitter.com/i/status/1217102231683653633");

// },
//     function () {
//         //Função executada quando o job finaliza
//         console.log("Cron job stopped!")
//     },
//     true, //Ativa o job
//     'America/Sao_Paulo' //Fuso horário.
// );


// app.get("/posta", function (req, res) {
//     console.log('Fez um get!')

//     cliente.tweetar("bom dia vamo acorda     https://twitter.com/i/status/1217102231683653633");

// });

// app.get("/", function (req, res) {
//     res.send('Estamos online')
// });

// var anotherJob = new CronJob('0 */25 * * * *', function () {
//     //Roda de 25 em 25 minutos

//     http.get('http://polar-bayou-92629.herokuapp.com')

// },
//     function () {
//         //Função executada quando o job finaliza
//         console.log("Testando manter onlinte!")
//     },
//     true, //Ativa o job
//     'America/Sao_Paulo' //Fuso horário.
// );
