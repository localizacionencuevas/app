(function() {
  'use strict';

  angular
  .module('app.main')
  .factory('utilidades', utilidades);

  function utilidades() {

    var servicio = {
      transformDate: transformDate,
      transformDate2: transformDate2,
      getLatitud: getLatitud,
      getLongitud: getLongitud
    };

    return servicio;

// FUNCIONES

    function transformDate (date) {
      if (date) {
        var fecha = new Date(date);
        var newDate = new Date(fecha.getTime()+fecha.getTimezoneOffset()*60*1000);
        var fechaString = newDate.toLocaleString();
        return fechaString;
      }else{
        return ("Sin Fecha");
      }
    }

    function transformDate2 (date) {
      if (date) {
        var fecha = new Date(date);
        var newDate = new Date(fecha.getTime()+fecha.getTimezoneOffset()*60*1000);
        var fechaString = newDate.toLocaleString().split(" ");
            return (fechaString[0]);
        
      }else{
        return ("Sin Fecha");
      }
      
    }

    function getLatitud (posicion) {
      return posicion.split(',')[0];
    }

    function getLongitud (posicion) {
      return posicion.split(',')[1];
    }
  }

})();