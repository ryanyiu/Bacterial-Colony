var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cheerio = require('cheerio');

var app = express();
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

var http = require('http').Server(app);

var port = (process.env.PORT || 8000);
http.listen(port, () => {
    console.log("LISTENING ON " + port);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/display.html');
});