(function() {
  'use strict';

  angular
    .module('app.routers')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider) {
    $stateProvider

      .state('app.fichaInstalacion.routers', {
        url: "/routers",
            views: {
              'contenido2': {
                templateUrl: "scripts/routers/routers.html",
                controller: 'routersController as vm'
              }
            }
        // template: "<span>{{vm.nombre}}<span>"
        // templateUrl: "scripts/routers/routers.html",
        // controller: 'routersController as vm'
      });
        
    }

})();