(function() {
  'use strict';

  angular
    .module('app.login')
    .config(appConfig);

  /* @ngInject */
  function appConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
          url: "/app",
          abstract: true,
          controller: 'appCtrl',
          templateUrl: 'scripts/main/menuTmpl.html'
        })
            .state('app.login', {
              url: "/login",
                views: {
                  'contenido': {
                    templateUrl: "scripts/login/login.html",
                    controller: 'loginController as vm'
                  }
                }
            });
        
    $urlRouterProvider.otherwise('/app/login');
    }

})();