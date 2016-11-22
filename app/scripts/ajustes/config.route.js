(function() {
  'use strict';

  angular
    .module('app.ajustes')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider
        .state('app.ajustes', {
          url: "/ajustes",
            views: {
              'contenido': {
                templateUrl: "scripts/ajustes/ajustes.html",
                controller: 'ajustesController as vm'
              }
            }
        });
        
    }

})();