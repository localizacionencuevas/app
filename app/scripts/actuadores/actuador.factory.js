(function() {
  'use strict';

  angular
  .module('app.actuadores')
  .factory('actuadorFactory', actuadorFactory);

  actuadorFactory.$inject = ['config'];
  function actuadorFactory(config) {

    var factory = {
      actuador: {},
      init: {
        desdeMapa: false,
        id: null,
        indice: null
      }

  //Funciones
      
    };

    return factory;

// FUNCIONES
   
  }

})();