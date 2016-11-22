(function() {
  'use strict';

  angular
    .module('app.fichaInstalacion')
    .controller('fichaInstalacionController', fichaInstalacion);

  fichaInstalacion.$inject = ['$scope', '$window', '$log', '$state', '$ionicScrollDelegate', 'instalacionFactory'];

  function fichaInstalacion ($scope, $window, $log, $state, $ionicScrollDelegate, instalacion) {
    $log.log('Routers');
    var scopeMapa = $scope.$parent.$parent;

    var vm = this;

    vm.nombreInstalacion = instalacion.nombreInstActual;

    vm.totalDispositivos = instalacion.totalDispositivos;
    vm.totalRouters = instalacion.totalRouters;
    vm.totalLocalizadores = instalacion.totalLocalizadores;
    vm.totalAgentes = instalacion.totalAgentes;
    vm.totalActuadores = instalacion.totalActuadores;

    vm.alarmasPendientes = (instalacion.alarmas.length > 0) ? true : false;;
    vm.textoAlarmas = (instalacion.alarmas.length > 0) ? 'Hay Alarmas Pendientes' : 'Sin Alarmas Pendientes';;

    vm.heightPanel = (((($window.innerHeight-43)/2) - 93)/2).toString() + "px";

    vm.functions = {
      toRouter: toRouter,
      toLocalizadores: toLocalizadores,
      toAgentes: toAgentes,
      toActuadores: toActuadores,
      toDetalles: toDetalles,
      toAlarmas: toAlarmas,
    };

  // FUNCIONES

    function toRouter (id) {
      $state.go('app.fichaInstalacion.routers');
    }

    function toLocalizadores (id) {
      $state.go('app.fichaInstalacion.localizadores');
    }

    function toAgentes (id) {
      $state.go('app.fichaInstalacion.agentes');
    }

    function toActuadores (id) {
      $state.go('app.fichaInstalacion.actuadores');
    }

    function toDetalles () {
      $state.go('app.fichaInstalacion.detalle');
    }

    function toAlarmas () {
      $state.go('app.fichaInstalacion.alarmas');
    }

    // EVENTOS
    var instalacionCargada = $scope.$on('instalacionCargada', function (event, data) {
      vm.nombreInstalacion = instalacion.instalacion.nombre;
      vm.totalDispositivos = instalacion.totalDispositivos;
      vm.totalRouters = instalacion.totalRouters;
      vm.totalLocalizadores = instalacion.totalLocalizadores;
      vm.totalAgentes = instalacion.totalAgentes;
      vm.totalActuadores = instalacion.totalActuadores;
    });

    var alarmasCargadas = $scope.$on('alarmasCargadas', function (event, alarmasData) {
      vm.alarmasPendientes = alarmasData.alarmasPendientes;
      vm.textoAlarmas = alarmasData.textoAlarmas;
    });
        
    $scope.$on('$destroy', function() {
      instalacionCargada();
      alarmasCargadas();
    });

  }

})();