//Modulo para escribi datos en un fichero de transitorios temporal formato json

module.exports = {

    
//cuando arranca el servicio, se comprueban cuantos ficeros de historicos hay, y 
//se inicializa el contador al valor que corresponda
    setFileCounter: () => {
        var file = require('fs');
        
        const dir = "./backup";

        file.readdir(dir, (err, files) => {
            console.log("Se han identificado "+ files.length + " ficheros de transitorios");
            
            if(module.exports.fileCounter == 0)
            {
                module.exports.fileCounter = 1;

            }
            else{
                module.exports.fileCounter = files.length ;

            }
                console.log("Configurados ficheros de transitorios")

        });


        

    },

    writeTransitoryFile: function (file_name, data) {

        var file = require('fs');
        //Primero leemos el tamaño del archivo, si es superior a 30MB, escribimos en otro fichero
        //si el contador de fichero esta a 0, es que no se ha creado ninguno aun, asi que no se intenta leer el tamaño
        if (module.exports.fileCounter > 0) {
;
            var name = 'backup/' + file_name + "_"+ module.exports.fileCounter;
            var stats = file.statSync( name + '.json');
            var fileSizeInBytes = stats["size"];
            var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
            console.log("Tamaño del fichero: " + fileSizeInMegabytes +  "Mb");

            //si el fichero supera los 30mb cambiamos el nombre para que la proxima vez que escriba, cree otro fichero
            if (fileSizeInMegabytes > 30.00) {
                console.log("El fichero es superior al tamaño máximo");
                module.exports.fileCounter = module.exports.fileCounter + 1;
                name = './backup/' + file_name + "_"+ module.exports.fileCounter;
                console.log("Modificado nombre del fichero: " +  name );


            }
        }
        else if (module.exports.fileCounter == 0){
            var name = 'backup/' + file_name + "_1";

        }

        file.appendFile( name + '.json', JSON.stringify(data), function (err) {
            if (err) {

                console.log("Error al almacenar los documentos en el fichero de transitorios");
                throw err;
            }
           
            console.log("Documentos almacenados correctamente en el fichero de transitorios " + (module.exports.fileCounter).toString() )

            
        })


    }

}
module.exports.setFileCounter()