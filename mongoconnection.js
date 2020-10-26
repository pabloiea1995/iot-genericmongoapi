
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
      const MongoClient = require('mongodb').MongoClient;
      const mongoConfig = require('./mongoConfig');

      // Connection URL
      const url = mongoConfig.DB;

      // Database Name
      const dbName = mongoConfig.database_name;


      // Use connect method to connect to the server
      
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

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

            log('ERROR', `Se ha producido un error en la inserción de documentos en la colección ${collection_name} de la base de datos ${dbName}`);
            reject()

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
  }
}
