(function() {
  'use strict';

  angular
    .module('app.localizadores')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider

      .state('app.fichaInstalacion.localizadores', {
        url: "/localizadores",
            views: {
              'contenido2': {
                templateUrl: "scripts/localizadores/localizadores.html",
                controller: 'localizadoresController as vm'
              }
            }
      });
        
    }

})();