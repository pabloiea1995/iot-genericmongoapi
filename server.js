const express = require('express');
var bodyParser = require('body-parser');
const config = require("./config")
const app = express();
const PORT = process.env.PORT || config.port;

app.use(require('express-status-monitor')({healthChecks: [{
  protocol: 'http',
  host: 'localhost',
  path: '/api/v1/insert/status',
  port: PORT
}]}));

app.use(bodyParser.json({limit: '50mb'})); //modificaciíon de parametr para permitir enviar paquetes grandes de datos
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//routes
app.use(require('./api'));


app.listen(PORT, () => {
  console.log('Server is running on PORT:',PORT);
});
//requiring and initializing online-log
const online_log = require("online-log");
let options = {
    enable_console_print: true,
    enable_colorful_console: true,
    log_level: config.logLevel
}
online_log(app, options);
//asign logging main function
const log = online_log.log

log('INFO', 'Online log iniciado correctamente');

