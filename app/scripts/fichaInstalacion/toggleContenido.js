(function () {
  'use strict';

  angular
  .module('app.fichaInstalacion')
  .directive('toggleContenido', toggleContenido);

  toggleContenido.$inject = ['$http', '$window'];
  function toggleContenido ($http, $window) {
      return {
        restrict: 'A',
        scope: false,
        link: function(scope, elem, attrs) {
        //elem.css('top', (($window.innerHeight-43)/2).toString() + "px");
            scope.$watch('vm.onDragUp', function (value){
                if(value){
                  elem.css('top', (($window.innerHeight-43)/2).toString() + "px");
                  scope.vm.displayMapa = 'none';
                    elem.animate({
                      top: 0,
                      height: ($window.innerHeight-43)},
                      250);
                }
            });

            scope.$watch('vm.onDragDown', function (value){
                if(value){
                  elem.css('top', "0px");
                  // scope.vm.displayMapa = 'none';
                    elem.animate({
                      top: (($window.innerHeight-43)/2),
                      height: (($window.innerHeight-43)/2)},
                      250);
                }
            });
        }
    };

}
})();