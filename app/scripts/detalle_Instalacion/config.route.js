(function() {
  'use strict';

  angular
    .module('app.detalleInstalacion')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider

      .state('app.fichaInstalacion.detalle', {
        url: "/detalle",
            views: {
              'contenido2': {
                templateUrl: "scripts/detalle_Instalacion/detalleInstalacion.html",
                controller: 'detalleInstalacionController as vm'
              }
            }
        // template: "<span>{{vm.nombre}}<span>"
        // templateUrl: "scripts/routers/routers.html",
        // controller: 'routersController as vm'
      });
        
    }

})();