(function() {
  'use strict';

  angular
    .module('app.ajustes')
    .controller('ajustesController', ajustes);

  ajustes.$inject = ['$scope', '$log', '$state', '$window', '$timeout', 'config', 'instalacionesFactory', 'instalacionFactory', 'dataService'];

  function ajustes ($scope, $log, $state, $window, $timeout, config, instalaciones, instalacion, dataService) {
    $log.log('Ajustes');

    var vm = this;

// VIEW MODEL
    vm.url = '';
    vm.urlWS = '';
    vm.instalaciones = [];
    vm.instPreferida = null;
    vm.mostrarInstalacion = false;
    vm.logged = false;

    vm.functions = {
      guardar: guardar,
      limpiar: actualizarViewModel,
      volver: volver
    };

    activate();

// FUNCIONES
    function activate () {
      if (config.getLoginStatus()) {
        vm.logged = true;
        if (instalaciones.instalacionesCargadas) {
          actualizarViewModel();
        }
        else {
          dataService.getData("instalaciones/")
            .then
            (function (Data) {
              // $log.log(Data);
              instalaciones.instalacionesCargadas = true;
              instalaciones.instalaciones = Data.data.results;
              instalaciones.newMarkerInst();

              actualizarViewModel();
            },
            function (e) {
              $log.warn('error al cargar instalaciones: ' + e.data.detail);
            });
        }
        
      }
      else{
        vm.url = config.urlToken;
        vm.urlWS = config.urlWS;
        if (config.backView === '') {
          $state.go('app.login');
        }
      }
    }

    function actualizarViewModel () {
        vm.instalaciones = instalaciones.instalaciones;
        vm.url = config.urlToken;
        vm.urlWS = config.urlWS;
        vm.mostrarInstalacion = config.preferencias.mostrarInstalacion;
        for (var i = 0; i < vm.instalaciones.length; i++) {
          if (vm.instalaciones[i].id === config.preferencias.idInstalacion) {
            vm.instPreferida = vm.instalaciones[i].id;
          }
        }
    }

    function guardar () {

      if (vm.logged) {
        var preferencias = {};
        var perfil = {};
        preferencias.mostrarInstalacion = vm.mostrarInstalacion;
        if (typeof vm.instPreferida === 'string') {
          vm.instPreferida = parseInt(vm.instPreferida);
        }
        preferencias.idInstalacion = vm.instPreferida;

        config.setUrlToken(vm.url);
        config.setUrlWS(vm.urlWS);
        config.setPreferencias(preferencias);

        perfil.preferencias = preferencias;
        perfil.loginData = config.getLoginData();
        perfil.urlToken = config.urlToken;
        perfil.urlWS = config.urlWS;

        $window.localStorage["perfilUsuario"] = JSON.stringify(perfil);
        $scope.$parent.$parent.functions.notificacion('Preferencias guardadas', 'green');
        $timeout(function() {
           volver();
        }, 1500);
      }
      else{
        config.setUrlToken(vm.url);
        config.setUrlWS(vm.urlWS);
        $scope.$parent.$parent.functions.notificacion('Url guardada con éxito', 'green');
        $timeout(function() {
          $state.go('app.login'); 
        }, 1500);
      }
    }

    function volver () {
      if (config.backView === 'app.fichaInstalacion.index') {
        $state.go('app.fichaInstalacion.index', {id: instalacion.instalacion.id});
      }
      else {
        $state.go(config.backView);
      }
    }
  }

})();