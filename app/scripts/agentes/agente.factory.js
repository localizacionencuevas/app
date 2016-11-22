(function() {
  'use strict';

  angular
  .module('app.agentes')
  .factory('agenteFactory', agenteFactory);

  agenteFactory.$inject = ['config'];
  function agenteFactory(config) {

    var factory = {
      agente: {},
      init: {
        desdeMapa: false,
        id: null,
        indice: null
      },
      socketAgente: {
        idAgente: null,
        tokenAgente: '',
        wsAgenteActivo: false
      },
      datosCaptura: []

  //Funciones
      
    };

    return factory;

// FUNCIONES
   
  }

})();