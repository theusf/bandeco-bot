var Twitter = require('twitter');
var config = require('./config.js');

var cliente = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token,
    access_token_secret: config.access_token_secret
});

cliente.tweetar = function (tweet) {
    
    console.log("tweet =", tweet);
    console.log(process.env.consumer_key)

    cliente.post('statuses/update', { status: tweet }, function (error, tweet, response) {
        if (error) console.log("error", error);
        else
            console.log("Tweet enviado.");
    });
}

//Exporta o cliente
module.exports = cliente;