(function() {
  'use strict';

  angular
    .module('app.routers')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider

      .state('app.fichaInstalacion.actuadores', {
        url: "/actuadores",
            views: {
              'contenido2': {
                templateUrl: "scripts/actuadores/actuadores.html",
                controller: 'actuadoresController as vm'
              }
            }
      });
        
    }

})();