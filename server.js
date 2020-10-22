const express = require('express');
var bodyParser = require('body-parser');
const config = require("./config")
const app = express();
const PORT = process.env.PORT || config.port;


app.use(require('express-status-monitor')({healthChecks: [{
  protocol: 'http',
  host: 'localhost',
  path: '/api/v1/insert/status',
  port: config.port
}]}));

app.use(bodyParser.json({limit: '50mb'})); //modificaciíon de parametr para permitir enviar paquetes grandes de datos
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//routes
app.use(require('./api'));


app.listen(PORT, () => {
  console.log('Server is running on PORT:',PORT);
});