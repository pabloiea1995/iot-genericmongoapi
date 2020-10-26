# Servicio de gestión de datos de facturas

Este servicio permite configurar una conexión a una base de datos mongo y una serie de colecciones permitidas para realizar insert de datos y consultas a esas colecciones. 
En realidad puede emplearse para cualquier fin, no solo para la gestión de datos de facturas.

## API

La api, bajo la url base /api/v1 expone 4 métodos principales:

### /allowedCollections

Devuelve la lista de colecciones configuradas en el servicio en el fichero de configuracion configuration.yml. Estas serán las únicas colecciones a las que se les podrá insertar datos o realizar consultas. el servicio no permitirá realizar consultas a más colecciones.

### /databaseName

Expone el nombre de la base de datos configurada en el fichero de configuración

### /insert

Permite insertar un único documento o una lista de ellos en una de las colecciones configuradas. La petición es un método POST con un parámetro ```collection```, que define la colección a la que insertar. El body de la petición es un objeto json a insertar o una lista de ellos.

El método añadirá a cada objeto enviado en el body una propiedad llamada ***insertTimeStamp*** con la fecha de inserción.

El resultado es una lista de los identificadores autogenerados por mongo en la inserción de los o él documento.

### /query

Permite realizar una consulta a una o más de las colecciones configuradas, devolviendo un objeto con los nombres de las colecciones como propiedades y el resultado de la consulta como valor.

Recibe tantos N parámetros ```collection```como colecciones se quiera consultar y en el body el objeto consulta en el formato de consulta de MongoDB. PAra construir estos objetos de consulta puedes emplear el Visual Qury Builder de Studio 3T y despues pulsar en la ventana Query Code y seleccionar el formato Node.js Driver.

Un ejemplo de consulta sería:
```
http://localhost:3001/api/v1/query?collection=test&collection=facturas

//cuerpo de la petición
{
   "fechaInicio": {
        "$gt": "2020-10-20T00:00:00.000Z"
    }
}

```

El resultado de esta consulta será

```
{
    "test": [...],
    "facturas": [...]
}

```