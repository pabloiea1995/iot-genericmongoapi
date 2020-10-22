

module.exports = {

  //contiene la funcion para realzar la insercion de la lista de valoresa a mongo
  

  //se le pasa el nombre de la coleccion donde insertar los documentos y la lista de documentos  
  insertDocuments: function (collection_name, document_list) {

    var correctInsert = true;
    const MongoClient = require('mongodb').MongoClient;
    const mongoConfig = require('./mongoConfig');

    // Connection URL
    const url = mongoConfig.DB;

    // Database Name
    const dbName = mongoConfig.database_name;
    

    // Use connect method to connect to the server
    try {

      

      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function (err, client) {

        try {

          var db = client.db(dbName);

          //console.log("Connected successfully to server");

          var collection = db.collection(collection_name);
          // Insertamos los docuemtos
          collection.insertMany(document_list, function (err, result) {
            if (!err) {

              request_status = true;
              console.log("Lista de " + document_list.length + " documentos insertada correctamente en la coleccion " + collection_name);
              client.close()

            }
            else {

              //Si los documento no se pueden insertar se almacenarán en un archivo de backup de transitorios para 
              //poder insertarlos manualmente

              //console.log(error)
              console.log("No se han podido insertar los documentos en la base de datos mongo")
              const transitoryFile = require("./transitoryFile");
                  transitoryFile.writeTransitoryFile("transitory_historic_file",document_list )
                correctInsert = false;
                client.close()

            }



          });
          
        }
        catch (error){
          console.log(error)
        
        }

      });
    }
    catch (error) {
      //module.exports.request_status = false;
    }

    /**
         * FIXME:
         * -- Modificar el valor de result a false cuando no se ha podido grabar en mongo para cmbiar la 
         * repsuesta del metodo post
         */
    
    return correctInsert;

  },
  /**
   * Genera el nombre de la coleccion que corresponde a la frecuencia introducida como parámetro
   * @param {integer} frequency 
   */
  collectionNameGenerator: function(frequency){

      var collection_name = "marca_" + frequency 

    return collection_name;
  }
}
