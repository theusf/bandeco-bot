require('dotenv').config();

module.exports = {
  consumer_key: process.env.KEY,
  consumer_secret: process.env.SECRET,
  access_token_key: process.env.TOKEN,
  access_token_secret: process.env.TOKEN_SECRET
}
