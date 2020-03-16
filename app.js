'use strict';

var app = require("./config/server.js");
var cliente = require("./config/twitter.js"); //Importa o arquivo twitter.js
var CronJob = require('cron').CronJob; //Importa o "node-cron"
var http = require('http');

const request = require('request');
const cheerio = require('cheerio');

const base_url = 'http://www.prefeitura.unicamp.br/apps/site/cardapio.php';


const titulo_refeicoes = {
    0: 'Almoço 🍽️',
    1: 'Almoço Vegetariano 🥗🍴',
    2: 'Jantar 🍲',
    3: 'Jantar Vegetariano 🥗🍴'
}


const getPage = ( url, cb ) => {
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
        TITULO: '',
        DATA: '',
        REFEICAO: ''
       }

       obj['DATA'] = $titulo.text().split('s - ').pop();
       obj['TITULO'] = titulo_refeicoes[i]

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

const post = () => {

    getPage( base_url, (html) => {
        let data = parsePage(html);

        if (data.length === 0)
            cliente.tweetar('Sem bandeco hoje 😔🤚');
        else {
            const emojis = {
                ABACAXI: '🍍',
                MAÇA: '🍎',
                MANGA: '🥭',
                UVA: '🍇',
                TANGERINA: '🍊',
                LARANJA: '🍊',
                LIMÃO: '🍋'
            }
        
            for (var i = 0; i<4 ; i++ ) {
                const suco =  data[i]['SUCO:'];
                const tweet = `${data[i]['DATA']}\r\n${titulo_refeicoes[i]}\r\n${data[i]['REFEICAO']}\r\n \r\nPRATO PRINCIPAL: ${data[i]['PRATO PRINCIPAL:']}\r\n \r\nSALADA: ${data[i]['SALADA:']}\r\n \r\nSOBREMESA: ${data[i]['SOBREMESA:']}\r\n \r\nSUCO: ${suco} ${(emojis[suco] ? emojis[suco] : '') }`
                //console.log(tweet)
                cliente.tweetar(tweet);
            }
        }
    }
)};

//post();

var job = new CronJob('00 30 8 * * 1-5', function () {
//    Roda todo dia às 0:08:030

    post();

},
    function () {
        //Função executada quando o job finaliza
        console.log("Cron job stopped!")
    },
    true, //Ativa o job
    'America/Sao_Paulo' //Fuso horário.
);


// app.get("/posta", function (req, res) {
//     console.log('faz o post!')

//     post();

// });


var keepAwake = new CronJob('0 */23 * * * *', function () {
    //Roda de 23 em 23 minutos para manter o bot acordado

    http.get('http://bandecobot.herokuapp.com')

},
    function () {
        //Função executada quando o job finaliza
        console.log("Mantendo bot acordado")
    },
    true, //Ativa o job
    'America/Sao_Paulo' //Fuso horário.
);



app.get("/", function (req, res) {

    let url = base_url;

    if (req.query.data)
        url = url + '?d=' + req.query.data;
    
    getPage( url, (html) => {
        const data = parsePage(html);

        res.send(JSON.stringify(data));

    });
});


app.get("/posta", function (req, res) {

    post();

});

