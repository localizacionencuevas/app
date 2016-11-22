(function() {
  'use strict';

  angular
  .module('app.localizadores')
  .factory('localizadorFactory', localizadorFactory);

  localizadorFactory.$inject = ['config'];
  function localizadorFactory(config) {

    var factory = {
      localizador: {},
      init: {
        desdeMapa: false,
        id: null,
        indice: null
      },
  //Funciones
      ultimasPosiciones: ultimasPosiciones
      
    };

    return factory;

// FUNCIONES
    function ultimasPosiciones () {
      var posiciones = [];
      var long = factory.localizador.ultimas_posiciones.length;
      var recientes =  (long > 5) ? 7 : long+1;
      for (var i = 1; i < recientes; i++) {
        posiciones[i-1] = factory.localizador.ultimas_posiciones[long-i];
      }

      return posiciones;

    }
   
  }

})();