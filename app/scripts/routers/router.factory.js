(function() {
  'use strict';

  angular
  .module('app.routers')
  .factory('routerFactory', routerFactory);

  routerFactory.$inject = ['config'];
  function routerFactory(config) {

    var factory = {
      router: {},
      init: {
        desdeMapa: false,
        id: null,
        indice: null
      },
      // routerCargado: false

  //Funciones
      
    };

    return factory;

// FUNCIONES
   
  }

})();