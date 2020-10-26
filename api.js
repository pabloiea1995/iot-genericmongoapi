const express = require('express');
const mongoConnection = require('./mongoconnection')
const router = express.Router();
const mongoConfig = require('./mongoConfig')
const log = require("online-log").log



const baseURI = "/api/v1";

// Insertar un documento
router.post(baseURI + "/insert", (req, res) => {


  const  collectionName  = req.query.collection

  if (!req.body || Object.keys(req.body).length == 0) {

    log('WARN', 'Se ha realizado una petición de insercción sin body');
    res.status(409).send("ko - Se ha realizado una petición de insercción sin body")
    return

  }

  else if (!collectionName) {

    log('WARN', 'Se ha realizado una petición de inserción sin parámetro collectionName');

    res.status(409).send("ko - Se ha realizado una petición de inserción sin parámetro collectionName")
    return

  }


  if (!mongoConfig.collections.includes(collectionName)) {

    log('WARN', `Se ha intentado realizar una petición de inserción de datos en una colección no permitida [${collectionName}]`);
    res.status(401).send(`No está permitida la consulta a la colección ${collectionName}`)
    return 
  }

  log('DEBUG', `Recibida petición de insercción en la collección ${collectionName}`);
  log('TRACE', `El cuerpo de la petición es : [${JSON.stringify(req.body)}]`);

  try {

    req.body["insertTimeStamp"] = new Date().toISOString()

    if(!Array.isArray(req.body)){
      req.body = [req.body]
    }    
    //realizamos la insercion de los documentos en la coleccion de mongo de maxima frecuencia
    mongoConnection.insertDocuments(collectionName, req.body)
      //si la petición se realiza correctamente 
      .then((result) => {
        log('DEBUG', 'Petición procesada correctamente');
        log('DEBUG', result);
        res.status(200).send()
        return
      })
      .catch(err => {
        res.status(500).json(err)
        return
      })

  } catch (error) {

    log('ERROR', 'Se ha producido un error al procesar la consulta');
    log('ERROR', error);

  }

});

router.get(baseURI + "status", (req, res) => {
  res.status(200).json({ status: 'stillAlive :)' })
});







module.exports = router;


