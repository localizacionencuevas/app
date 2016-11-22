(function() {
  'use strict';

  angular
    .module('app.agentes')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider

      .state('app.fichaInstalacion.agentes', {
        url: "/agentes",
            views: {
              'contenido2': {
                templateUrl: "scripts/agentes/agentes.html",
                controller: 'agentesController as vm'
              }
            }
      });
        
    }

})();