module.exports = {


  //configuraciones de la conexion a mongo

    DB: "",
    database_name: "",
    max_resolution_collection_name : "",

    readMongoConfig: function(){
      const yaml = require('js-yaml');
      const fs = require('fs');

      try {

        const config = yaml.safeLoad(fs.readFileSync('configuration.yml', 'utf8'));
        //const indentedJson = JSON.parse(config);
        //Host de la base de datos 
        module.exports.DB = config["configuration"]["databases"]["mongodb"]["host"]; 
        //nombre de la base de datos
        module.exports.database_name = config["configuration"]["databases"]["mongodb"]["databaseName"]; 
        //lista de colecciones
        module.exports.collections = config["configuration"]["databases"]["mongodb"]["collections"]; 

        console.log("Configuracion de conexion a mongodb leida con exito")
    } catch (e) {
        console.log(e);
    }
    }
  }

  module.exports.readMongoConfig();
  
