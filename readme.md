# APP de gestión Localización en Cuevas
[![Localizacion en cuevas](https://cldup.com/QvZZtmnKTN.png)](http://www.localizacionencuevas.com)

Este repositorio contiene el código fuente de la aplicación de gestión de localizacion en cuevas, esta aplicación multiplataforma esta desarrollada usando el framework [Ionic](http://ionicframework.com/).

Para poner en marcha la aplicación seguir los siguientes pasos:

  - instalar [compass](http://compass-style.org/install/) 
  - npm install <- instala las librerias node.js para la construcción y la depuración.
  - bower install <- instala las librerias de cliente usadas por la aplicación.
  - cambiar el fichero [config.js](app/scripts/config.js) e introducir la ruta de la API y del Websocket.

Una vez descargado todo el código existen una serie de tareas grunt para la operativa normal:
  
  - grunt serve <- Lanza la aplicación en modo debug en el navegador
  - grunt platform add android <- acceso directo a cordova platform add android
  - grunt ionic <- acceso directo a ionic-cli

Este proyecto ha sido cofinanciado por la **Junta de Comunidades de Castilla la Mancha** bajo el número de expediente 1615ITA136.

[![Logo JCCM](https://cldup.com/y-bVZMxRzA.JPG)](http://www.jccm.es)