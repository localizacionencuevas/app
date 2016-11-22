(function() {
  'use strict';

  angular
    .module('app.alarmas')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider

      .state('app.fichaInstalacion.alarmas', {
        url: "/alarmas",
            views: {
              'contenido2': {
                templateUrl: "scripts/alarmas/alarmas.html",
                controller: 'alarmasController as vm'
              }
            }
      });
        
    }

})();