module.exports = {


    //configuraciones 
  
      readConfig: function(){
        const yaml = require('js-yaml');
        const fs = require('fs');
  
        try {
  
          const config = yaml.safeLoad(fs.readFileSync('configuration.yml', 'utf8'));
          //const indentedJson = JSON.parse(config);
          module.exports.port = config["configuration"]["deployment"]["port"]; 
  
          console.log("Configuracion  leida con exito")
      } catch (e) {
          console.log(e);
      }
      }
    }
  
    module.exports.readConfig();
    