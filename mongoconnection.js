const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const mongoConfig = require('./mongoConfig');
const log = require("online-log").log

module.exports = {


  /**
   * Inserta una lista de documentos en una coleccion determinada
   * @param {string} collection_name Colección a la que escribir la lista de documentos
   * @param {Array} document_list Lista de documentos a insertar
   * @param {Function} errorCalback Funcion a ejecutar en caso de error de la petición de inserción
   */

  insertDocuments: function (collection_name, document_list) {

    return new Promise((resolve, reject) => {


      // Connection URL
      const url = mongoConfig.DB;

      // Database Name
      const dbName = mongoConfig.database_name;


      // Use connect method to connect to the server

      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

        if (!err) {
          try {
            var db = client.db(dbName);

            var collection = db.collection(collection_name);
            // Insertamos los docuemtos
            collection.insertMany(document_list, function (err, result) {

              if (!err) {
                log('TRACE', `Lista de ${document_list.length} documentos insertada correctamente en la colección ${collection_name}`);
                client.close()
                resolve(result)

              }
              else {
                //Si los documento no se pueden insertar se almacenarán en un archivo de backup de transitorios para 
                //poder insertarlos manualmente
                //console.log(error)
                log('ERROR', 'No se han podido insertar los documentos en la base de datos mongo');
                const transitoryFile = require("./transitoryFile");
                transitoryFile.writeTransitoryFile("transitory_historic_file", document_list)
                client.close()
                reject(err)
              }
            });

          }
          catch (error) {
            client.close()

            log('ERROR', `Se ha producido un error en la inserción de documentos en la colección ${collection_name} de la base de datos ${dbName}`);
            reject()

          }
        }
        else {
          log('ERROR', 'Error en la creación del cliente de mongo');
          log('ERROR', err);
          reject(err)
        }

      });

    })

  },
  /**
   * Genera el nombre de la coleccion que corresponde a la frecuencia introducida como parámetro
   * @param {integer} frequency 
   */
  collectionNameGenerator: function (frequency) {

    var collection_name = "marca_" + frequency

    return collection_name;
  },

  executeQuery: function (collection_name, queryObject) {

    return new Promise((resolve, reject) => {


      // Connection URL
      const url = mongoConfig.DB;

      // Database Name
      const dbName = mongoConfig.database_name;


      // Use connect method to connect to the server

      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

        if (!err) {
          try {
            var db = client.db(dbName);

            var collection = db.collection(collection_name);
            log('DEBUG', `Consulta realizada con éxito para la coleccion ${collection_name}`);
            //Consulta de los documentos
            resolve(collection.find(queryObject).toArray())


          }
          catch (error) {

            log('ERROR', `Se ha producido un error en la obtencion de documentos en las colección [${collection_name}] de la base de datos [${dbName}]`);
            log('ERROR', error);
            reject(error)
            client.close()


          }
        }
        else {
          log('ERROR', 'Error en la creación del cliente de mongo');
          log('ERROR', err);
          reject(err)
        }


      });

    })

  },
  executeAdvancedQuery: function (collection_name, queryObject) {

    return new Promise((resolve, reject) => {


      // Connection URL
      const url = mongoConfig.DB;

      // Database Name
      const dbName = mongoConfig.database_name;


      // Use connect method to connect to the server

      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

        if (!err) {
          try {
            var db = client.db(dbName);

            var collection = db.collection(collection_name);
            log('DEBUG', `Consulta realizada con éxito para la coleccion ${collection_name}`);
            //Consulta de los documentos
            const { query, sort, limit, projection } = queryObject
            if (limit) {
              resolve(collection.find(query).sort(sort).project(projection).limit(limit).toArray())
            }
            else {
              resolve(collection.find(query).sort(sort).project(projection).toArray())

            }


          }
          catch (error) {

            log('ERROR', `Se ha producido un error en la obtencion de documentos en las colección [${collection_name}] de la base de datos [${dbName}]`);
            log('ERROR', error);
            reject(error)
            client.close()


          }
        }
        else {
          log('ERROR', 'Error en la creación del cliente de mongo');
          log('ERROR', err);
          reject(err)
        }


      });

    })

  },
  findById: function (collection_name, id) {

    return new Promise((resolve, reject) => {


      // Connection URL
      const url = mongoConfig.DB;

      // Database Name
      const dbName = mongoConfig.database_name;


      // Use connect method to connect to the server

      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

        log('DEBUG', `Realizando consulta para el ojeto con id ${id} para la coleccion ${collection_name}`);

        if (!err) {
          try {
            var db = client.db(dbName);

            var collection = db.collection(collection_name);
            log('DEBUG', `Consulta realizada con éxito para la coleccion ${collection_name}`);
            //Consulta de los documentos
            resolve(collection.findOne({_id: ObjectId(id)}))


          }
          catch (error) {

            log('ERROR', `Se ha producido un error en la obtencion de documentos en las colección [${collection_name}] de la base de datos [${dbName}]`);
            log('ERROR', error);
            reject(error)
            client.close()


          }
        }
        else {
          log('ERROR', 'Error en la creación del cliente de mongo');
          log('ERROR', err);
          reject(err)
        }


      });

    })


  },
  /**
   * Actualiza un elemeto existente
   * @param {string} collection_name 
   * @param {Object} document 
   */
  updateOne: function (collection_name, document) {

    return new Promise((resolve, reject) => {


      // Connection URL
      const url = mongoConfig.DB;

      // Database Name
      const dbName = mongoConfig.database_name;


      // Use connect method to connect to the server

      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

        log('DEBUG', `Realizando consulta  de actualización para el ojeto con id ${document._id} para la coleccion ${collection_name}`);

        if (!err) {
          try {
            var db = client.db(dbName);

            var collection = db.collection(collection_name);
            log('DEBUG', `Consulta realizada con éxito para la coleccion ${collection_name}`);
            //Actualización del documento
            //primero se elimina el id del documento
            let updateId = ObjectId(document._id)
            delete document._id
            resolve(collection.replaceOne({_id: updateId}, document  ))


          }
          catch (error) {

            log('ERROR', `Se ha producido un error en la actualización del documento en la colección [${collection_name}] de la base de datos [${dbName}]`);
            log('ERROR', error);
            reject(error)
            client.close()


          }
        }
        else {
          log('ERROR', 'Error en la creación del cliente de mongo');
          log('ERROR', err);
          reject(err)
        }


      });

    })


  },

   /**
   * Elimina un elemeto existente
   * @param {string} collection_name 
   * @param {Object} document 
   */
  deleteOne: function (collection_name, id) {

    return new Promise((resolve, reject) => {


      // Connection URL
      const url = mongoConfig.DB;

      // Database Name
      const dbName = mongoConfig.database_name;


      // Use connect method to connect to the server

      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

        log('DEBUG', `Realizando consulta  de eliminación para el ojeto con id ${id} para la coleccion ${collection_name}`);

        if (!err) {
          try {
            var db = client.db(dbName);

            var collection = db.collection(collection_name);
            log('DEBUG', `Consulta realizada con éxito para la coleccion ${collection_name}`);
            //Eliminación del documento
            resolve(collection.deleteOne({_id: ObjectId(id)} ))


          }
          catch (error) {

            log('ERROR', `Se ha producido un error en la actualización del documento en la colección [${collection_name}] de la base de datos [${dbName}]`);
            log('ERROR', error);
            reject(error)
            client.close()


          }
        }
        else {
          log('ERROR', 'Error en la creación del cliente de mongo');
          log('ERROR', err);
          reject(err)
        }


      });

    })


  }

}
