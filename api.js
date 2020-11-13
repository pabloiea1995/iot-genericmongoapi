const express = require('express');
const mongoConnection = require('./mongoconnection')
const router = express.Router();
const mongoConfig = require('./mongoConfig')
const log = require("online-log").log



const baseURI = "/api/v1";


router.get(baseURI + "/allowedCollections", (_, res) => {

  log('DEBUG', 'Recibida petición de consulta de colecciones permitidas');
  log('TRACE', mongoConfig.collections);
  res.status(200).send(mongoConfig.collections)
  return;

})


router.get(baseURI + "/databaseName", (_, res) => {

  log('DEBUG', 'Recibida petición de consulta de base de datos configurada');
  log('TRACE', mongoConfig.database_name);
  res.status(200).send(mongoConfig.database_name)

  return;

})



/**
 * Inserta un documento o lista de documentos en una de las colecciones permitidas
 * @param {string} collection - Coleccion a la que insertar los o el documento.
 */
router.post(baseURI + "/insert", (req, res) => {

  const collectionName = req.query.collection

  if (!req.body || Object.keys(req.body).length == 0) {

    log('WARN', 'Se ha realizado una petición de insercción sin body');
    res.status(400).send("ko - Se ha realizado una petición de insercción sin body")
    return

  }

  else if (!collectionName) {

    log('WARN', 'Se ha realizado una petición de inserción sin parámetro collectionName');

    res.status(400).send("ko - Se ha realizado una petición de inserción sin parámetro collectionName")
    return

  }


  if (!mongoConfig.collections.includes(collectionName)) {

    log('WARN', `Se ha intentado realizar una petición de inserción de datos en una colección no permitida [${collectionName}]`);
    res.status(403).send(`No está permitida la consulta a la colección ${collectionName}`)
    return
  }

  log('DEBUG', `Recibida petición de inserción en la colección ${collectionName}`);
  log('TRACE', `El cuerpo de la petición es : [${JSON.stringify(req.body)}]`);

  try {

    req.body["insertTimeStamp"] = new Date()

    if (!Array.isArray(req.body)) {
      req.body = [req.body]
    }
    //realizamos la insercion de los documentos en la coleccion de mongo de maxima frecuencia
    mongoConnection.insertDocuments(collectionName, req.body)
      //si la petición se realiza correctamente 
      .then((result) => {
        log('DEBUG', 'Petición procesada correctamente');
        log('TRACE', result);
        res.status(200).send(result.ops.map(obj => {
          return obj._id
        }))
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

/**
 * ejecuta la consulta enviada a todas las bases de datos configuradas y seleccionadas
 * @param {array} collection Lista de colecciones a las que realizar la consulta
 */
router.post(baseURI + "/query", async (req, res) => {

  const { collection } = req.query
  if (!req.body) {
    res.status(403).send(`No se ha enviado cuerpo para la petición`)

  }
  log('DEBUG', `Recibida petición de consulta`);

  log('TRACE', `Lista de colecciones configuradas en la consulta: ${collection}`);
  log('TRACE', `Objeto consulta:`);
  log('TRACE', req.body);
  if (collection || collection !== "") {

    //comprobacion de que las colecciones solicitadas están configuradas(permitidas)


    if (Array.isArray(collection)) {

      for (let col in collection) {
        if (!mongoConfig.collections.includes(collection[col])) {
          log('WARN', `Se ha realizado una consulta a la colección no configurada ${colection[col]}`);
          res.status(403).send(`La coleccion ${collection[col]} no está configurada entre las colecciones permitidas`)
          return
        }
      }
      //si todas las colecciones estan permitidas, se realizan las peticiones
      //Consulta de varias colecciones
      let result = []

      for (let col in collection) {
        try {
          let queryResult = await mongoConnection.executeQuery(collection[col], req.body)
          result.push({ [collection[col]]: queryResult })
        }
        catch (err) {
          res.status(500).json(result)

        }
      }
      res.status(200).json(result)
      return
    }
    else {
      //comprobación de que la coleccion esta pemitida
      if (!mongoConfig.collections.includes(collection)) {
        log('WARN', `Se ha realizado una consulta a la colección no configurada ${collection}`);
        res.status(403).send(`La coleccion ${collection} no está configurada entre las colecciones permitidas`)
        return;
      }
      log('DEBUG', `Solicitada consulta a mongo para una única coleccion: ${collection}`);
      //consulta de una sola coleccion


      mongoConnection.executeQuery(collection, req.body).then(resolve => {
        res.status(200).json({ [collection]: resolve })
        return
      }).catch(err => {
        res.status(500).json(err)
        return
      })

    }
  } else {
    log('WARN', 'Se ha realizado una consulta a mongo para una coleccion vacia');
    res.status(400).send("El parámetro collection no es válido")
    return
  }


})


router.post(baseURI + "/advancedQuery", async (req, res) => {

  const { collection } = req.query
  if (!req.body) {
    res.status(403).send(`No se ha enviado cuerpo para la petición`)

  }
  log('DEBUG', `Recibida petición de consulta avanzada`);
  log('TRACE', `Lista de colecciones configuradas en la consulta: ${collection}`);
  log('TRACE', `Objeto consulta:`);
  log('TRACE', req.body);
  if (collection || collection !== "") {

    //comprobacion de que las colecciones solicitadas están configuradas(permitidas)

    if (Array.isArray(collection)) {

      for (let col in collection) {
        if (!mongoConfig.collections.includes(collection[col])) {
          log('WARN', `Se ha realizado una consulta a la colección no configurada ${colection[col]}`);
          res.status(403).send(`La coleccion ${collection[col]} no está configurada entre las colecciones permitidas`)
          return
        }
      }
      //si todas las colecciones estan permitidas, se realizan las peticiones
      //Consulta de varias colecciones
      let result = []

      for (let col in collection) {
        try {
          let queryResult = await mongoConnection.executeAdvancedQuery(collection[col], req.body)
          result.push({ [collection[col]]: queryResult })
        }
        catch (err) {
          res.status(500).send(err)
          return
        }
      }
      res.status(200).json(result)
      return
    }
    else {
      //comprobación de que la coleccion esta pemitida
      if (!mongoConfig.collections.includes(collection)) {
        log('WARN', `Se ha realizado una consulta a la colección no configurada ${collection}`);
        res.status(403).send(`La coleccion ${collection} no está configurada entre las colecciones permitidas`)
        return;
      }
      log('DEBUG', `Solicitada consulta a mongo para una única coleccion: ${collection}`);
      //consulta de una sola coleccion


      mongoConnection.executeAdvancedQuery(collection, req.body).then(resolve => {
        res.status(200).json({ [collection]: resolve })
        return
      }).catch(err => {
        res.status(500).json(err)
        return
      })

    }
  } else {
    log('WARN', 'Se ha realizado una consulta a mongo para una coleccion vacia');
    res.status(400).send("El parámetro collection no es válido")
    return
  }




})

/**
 * REaliza una consulta por id a una coleccion en concreto
 */
router.get(baseURI + "/findById", async (req, res) => {

  const { collection, id } = req.query

  log('DEBUG', `Recibida petición de consulta avanzada`);
  log('TRACE', `Lista de colecciones configuradas en la consulta: ${collection}`);
  log('TRACE', `Objeto consulta:`);
  log('TRACE', req.body);
  if (collection || collection !== "" || id || id !== "") {

    //comprobacion de que las colecciones solicitadas están configuradas(permitidas)

    if (Array.isArray(collection)) {

      log('WARN', `Se ha realizado una consulta de varias colecciones, no permitida en el metodo de busqueda por id`);
      res.status(403).send(`La consulta de busqueda por id solo admite una colección`)
    }
    else {
      //comprobación de que la coleccion esta pemitida
      if (!mongoConfig.collections.includes(collection)) {
        log('WARN', `Se ha realizado una consulta a la colección no configurada ${collection}`);
        res.status(403).send(`La coleccion ${collection} no está configurada entre las colecciones permitidas`)
        return;
      }
      log('DEBUG', `Solicitada consulta a mongo para una única coleccion: ${collection}`);
      //consulta de una sola coleccion
      mongoConnection.findById(collection, id).then(resolve => {
        res.status(200).json(resolve)
        return
      }).catch(err => {
        res.status(500).json(err)
        return
      })

    }
  } else {
    log('WARN', 'Se ha realizado una consulta a mongo para una coleccion vacia');
    res.status(400).send("El parámetro collection no es válido")
    return
  }




})
/**
 * REaliza una consulta por id a una coleccion en concreto para actualizar un objeto
 */
router.put(baseURI + "/updateOne", async (req, res) => {

  const { collection } = req.query
  const document = req.body

  log('DEBUG', `Recibida petición de consulta avanzada`);
  log('TRACE', `Lista de colecciones configuradas en la consulta: ${collection}`);
  log('TRACE', `Objeto consulta:`);
  log('TRACE', req.body);
  if (collection || collection !== "" || body) {

    //comprobacion de que el elemento existe en mongo (tiene propiedad _id)
    if (!document._id) {
      log('WARN', `El documento a actualizar aun no existe en la coleccion ${collection}`);
      res.status(403).send(`El documento a actualizar aun no existe en la coleccion ${collection}`)
      return;
    }
    //comprobacion de que las colecciones solicitadas están configuradas(permitidas)

    if (Array.isArray(collection)) {

      log('WARN', `Se ha realizado una consulta de varias colecciones, no permitida en el metodo de busqueda por id`);
      res.status(403).send(`La consulta de busqueda por id solo admite una colección`)
    }
    else {
      //comprobación de que la coleccion esta pemitida
      if (!mongoConfig.collections.includes(collection)) {
        log('WARN', `Se ha realizado una consulta a la colección no configurada ${collection}`);
        res.status(403).send(`La coleccion ${collection} no está configurada entre las colecciones permitidas`)
        return;
      }
      let id = document._id
      log('DEBUG', `Solicitada consulta a mongo de actualizacion de un elemento con id ${document._id} para una única coleccion: ${collection}`);
      //consulta de una sola coleccion
      //se añade al objeto la propiedad lasUpdateTimeStamp
      document["lastUpdateTimeStamp"] = new Date()
      mongoConnection.updateOne(collection, document).then(resolve => {

        if (resolve.name === "MongoError") {
          res.status(500).json("Se ha producido un error en la actualización")
          return
        }
        let result = resolve.ops[0]
        result._id = id

        res.status(200).json(result)
        return
      }).catch(err => {
        log('ERROR', err);
        res.status(500).send(err)
        return
      })

    }
  } else {
    log('WARN', 'Se ha realizado una consulta a mongo para una coleccion vacia');
    res.status(400).send("El parámetro collection no es válido")
    return
  }




})
/**
 * REaliza una consulta por id a una coleccion en concreto para actualizar un objeto
 */
router.delete(baseURI + "/deleteOne", async (req, res) => {

  const { collection } = req.query
  const { id } = req.query

  log('DEBUG', `Recibida petición de consulta avanzada`);
  log('TRACE', `Lista de colecciones configuradas en la consulta: ${collection}`);
  log('TRACE', `Objeto consulta:`);
  log('TRACE', req.body);
  if (collection || collection !== "" || id) {

    //comprobacion de que el elemento existe en mongo (tiene propiedad _id)
    if (!id) {
      log('WARN', `El documento a eliminar aun no existe en la coleccion ${collection}`);
      res.status(403).send(`El documento a eliminar aun no existe en la coleccion ${collection}`)
      return;
    }
    //comprobacion de que las colecciones solicitadas están configuradas(permitidas)

    if (Array.isArray(collection)) {

      log('WARN', `Se ha realizado una consulta de varias colecciones, no permitida en el metodo de busqueda por id`);
      res.status(403).send(`La eliminación por id solo admite una colección`)
    }
    else {
      //comprobación de que la coleccion esta pemitida
      if (!mongoConfig.collections.includes(collection)) {
        log('WARN', `Se ha realizado una consulta a la colección no configurada ${collection}`);
        res.status(403).send(`La coleccion ${collection} no está configurada entre las colecciones permitidas`)
        return;
      }
      log('DEBUG', `Solicitada consulta a mongo de eliminación de un elemento con id ${id} para una única coleccion: ${collection}`);
      //consulta de una sola coleccion
      
      mongoConnection.deleteOne(collection, id).then(resolve => {
        if (resolve.name === "MongoError") {
          res.status(500).json("Se ha producido un error en la eliminación")
          return
        }
        res.status(200).send("ok")
        return
      }).catch(err => {
        log('ERROR', err);
        res.status(500).send(err)
        return
      })

    }
  } else {
    log('WARN', 'Se ha realizado una consulta a mongo para una coleccion vacia');
    res.status(400).send("El parámetro collection no es válido")
    return
  }




})

router.get(baseURI + "status", (req, res) => {
  res.status(200).json({ status: 'stillAlive :)' })
});










module.exports = router;


