var Twitter = require('twitter');
var config = require('./twitterConfig');

var cliente = new Twitter(config);

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