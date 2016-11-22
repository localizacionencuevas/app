(function() {
  'use strict';

  angular
    .module('app.detalleInstalacion')
    .controller('detalleInstalacionController', detalleInst);

  detalleInst.$inject = ['$scope', '$log', '$state', '$window', '$ionicScrollDelegate', 'config', 'instalacionFactory'];

  function detalleInst ($scope, $log, $state, $window, $ionicScrollDelegate, config, instalacion) {
    $log.log('Detalle Instalación');
    var scopeMapa = $scope.$parent.$parent;

    var vm = this;

    vm.mapaVisible = true;

    vm.nombreInstalacion = instalacion.instalacion.nombre;

    vm.titulo = 'Detalle de la instalación';
    vm.instalacion = instalacion.instalacion;
    
    vm.functions = {
      onDragUp: onDragUp,
      onDragDown: onDragDown
    };

    activate();

  // FUNCIONES
    function activate() {
      if (!config.getLoginStatus()) {
        $state.go('app.login');
      }
      scopeMapa.vm.btnPlantasVisible = false;
    }

    function onDragUp () {
      if (scopeMapa.vm.mapaVisible) {
        scopeMapa.vm.functions.onDragUp();
        $ionicScrollDelegate.scrollTop();
      }
      
    }

    function onDragDown () {
      if (!scopeMapa.vm.mapaVisible) {
        scopeMapa.vm.functions.onDragDown();
        $ionicScrollDelegate.scrollTop();
      }
    }

  // EVENTOS
    $scope.$on('$stateChangeStart', function() {
      //reseteamos alturas
      scopeMapa.vm.btnPlantasVisible = true;
      if (!scopeMapa.vm.mapaVisible) {
        scopeMapa.vm.heightContent = (($window.innerHeight-43)/2).toString() + "px";
        scopeMapa.vm.displayMapa = 'block';
        scopeMapa.vm.mapaVisible = true;
      }
              
    });

  }

})();