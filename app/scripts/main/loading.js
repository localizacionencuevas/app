(function () {
  'use strict';

  angular
  .module('app.main')
  .directive('loading', loading);

  loading.$inject = ['$http'];
  function loading ($http) {
      return {
        restrict: 'AE',
        replace: true,
        // template: '<div class="loading-spiner-holder"><div class="loading-spiner"><ion-spinner icon="bubbles"></ion-spinner></div></div>',
        template: '<div class="loading-spiner-holder"><div class="loading-spiner"><img class="imagen" src="images/loader.gif" /></div></div>',
        scope: {},
        link: function(scope, elem, attrs) {
            scope.isLoading = function () {
                // return true;
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (value){
                if(value){
                    elem.show();
                }
                else{
                    elem.hide();
                }
            });
        }
    };

}
})();