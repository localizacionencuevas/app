(function() {
  'use strict';

  angular
    .module('app.instalaciones')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider
        .state('app.instalaciones', {
          url: "/instalaciones",
            views: {
              'contenido': {
                templateUrl: "scripts/instalaciones/instalaciones.html",
                controller: 'instalacionesController as vm'
              }
            }
        });
        
    }

})();