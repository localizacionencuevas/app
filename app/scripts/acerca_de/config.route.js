(function() {
  'use strict';

  angular
    .module('app.acercaDe')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app.acercaDe', {
        url: "/acercaDe",
        views: {
          'contenido': {
            templateUrl: "scripts/acerca_de/acercaDe.html",
            controller: 'acercaDeController as vm'
          }
        }
      });
        
    }

})();