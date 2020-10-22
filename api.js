const express = require('express');
const mongoConnection = require('./mongoconnection')
const router = express.Router();
const mongoConfig = require('./mongoConfig')
const uuid = require('uuid')
//Clase para realizar los insert a la base de datos de mongo

const baseURI = "/api/v1";

// Insertar un documento
router.post(baseURI + "/insert", (req, res) => {

  //El objet req es  json con el documentos de mongo
  if(!req.body){
    response_json = {
      entity: "facturasdatabasehandler",
      message: `${now.toISOString()} ERROR -- POST couldn't be executed because you are tryng to insert an empty list. `  , 
      code: "KO"
    }
  }
 
  var response_json
  var now = new Date();
  try {
    req.body["uid"] = uuid.v4()
    req.body["insertTimeStamp"] = new Date().toISOString()
    //realizamos la insercion de los documentos en la coleccion de mongo de maxima frecuencia
    var result = mongoConnection.insertDocuments(mongoConfig.colletionName, [req.body]);
    console.log(result)
    if (result) {
      response_json = {
        entity: "facturasdatabasehandler",
        message: "POST  succesfully executed, document inserted on " + now.toISOString(),
        code: "OK"

      }

    }
    else {
      response_json = {
        entity: "facturasdatabasehandler",

        message: "ERROR -- POST couldn't be executed on " + now.toISOString(),
        code: "KO"
      }
    }




  } catch (error) {
    console.error(error)


  }
  req.body = []

  res.json(response_json);

});





router.get(baseURI + "status", (req, res) => {
  res.status(200).json({ status: 'stillAlive :)' })        
});







module.exports = router;


