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
        module.exports.DB = config["configuration"]["databases"]["mongodb"]["host"]; 
        module.exports.database_name = config["configuration"]["databases"]["mongodb"]["databaseName"]; 
        module.exports.colletionName = config["configuration"]["databases"]["mongodb"]["colletionName"]; 

        console.log("Configuracion de conexion a mongodb leida con exito")
    } catch (e) {
        console.log(e);
    }
    }
  }

  module.exports.readMongoConfig();
  console.log(module.exports.DB);
  console.log(module.exports.database_name);
  console.log(module.exports.max_resolution_collection_name)