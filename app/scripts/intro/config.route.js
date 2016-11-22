(function() {
  'use strict';

  angular
    .module('app.intro')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
          url: "/app",
          abstract: true,
          templateUrl: 'scripts/main/menuTmpl.html'
        })
          .state('app.intro', {
            url: "/intro",
            views: {
              'contenido': {
                templateUrl: 'scripts/intro/intro.html',
                controller: 'introController as vm'
              }
            }
            
          });
        
    $urlRouterProvider.otherwise('/app/login');
    }

})();