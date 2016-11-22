(function() {
  'use strict';

  angular
    .module('app.login')
    .controller('loginController', login);

  login.$inject = ['$scope', '$log', '$state', '$window', '$timeout', '$ionicSideMenuDelegate', 'dataService', 'config', 'instalacionFactory', 'instalacionesFactory'];

  function login ($scope, $log, $state, $window, $timeout, $ionicSideMenuDelegate, dataService, config, instalacion, instalaciones) {
    $log.log('Intro');
    $ionicSideMenuDelegate.canDragContent(false);

    var vm = this;

// VIEW MODEL
    vm.loginData = {
      username: 'magomez@servinet.net',
      password: 'magm'
    };

    vm.functions = {
      submit: submit,
      toAjustes: toAjustes
    };


  // $timeout(function() {
  //    $scope.$parent.$parent.menuDraggable = true;
  // }, 200);

// FUNCIONES
    function submit () {
      dataService.login(vm.loginData)
      .then
      (function () {

          config.setLoginData(vm.loginData);
          $scope.$parent.$parent.functions.notificacion('Login Correcto', 'green');
          dataService.getData("usuarios/")
          .then
            (function (data) {
              config.setUserData(data.data.detalle);
              var preferencias = {};
              var perfil = {};
              preferencias.mostrarInstalacion = data.data.detalle.mostrar_instalacion_directamente;
              preferencias.idInstalacion = data.data.detalle.id_instalacion_a_mostrar;
              config.setPreferencias(preferencias);

              perfil.preferencias = preferencias;
              perfil.loginData = vm.loginData;
              perfil.urlToken = config.urlToken;
              perfil.urlWS = config.urlWS;

              $window.localStorage["perfilUsuario"] = JSON.stringify(perfil);
                if (config.preferencias.mostrarInstalacion) {
                    dataService.getData("instalaciones/")
                        .then
                        (function (Data) {
                            // $log.log(Data);
                            instalaciones.instalacionesCargadas = true;
                            instalaciones.instalaciones = Data.data.results;
                            instalaciones.newMarkerInst();
                            var instalacionSeleccionada = instalaciones.getInstalacionPorId(parseInt(config.preferencias.idInstalacion, 10));
                            instalacion.nombreInstActual = instalacionSeleccionada.nombre;
                            instalacion.idInstalacion = instalacionSeleccionada.id;
                            $state.go('app.fichaInstalacion.index', {id: config.preferencias.idInstalacion});
                        },
                        function (e) {
                            $log.warn('error al cargar instalaciones: ' + e.data.detail);
                            $state.go('app.instalaciones');
                        });

                    //Obtenemos las alarmas
                    dataService.getData("alarmas/")
                        .then
                        (function (Data) {
                            instalaciones.alarmas = Data.data;
                        },
                        function (e) {
                            $log.warn('error al cargar alarmas: ' + e.data.detail);
                        });
                }else{
                    $state.go('app.instalaciones');
                }
            },
            function (e) {
              $log.info(e.data.detail);
              $log.warn('error al obtener datos del usuario: ' + e.data.detail);
              $state.go('app.instalaciones');
              // deferred.resolve();
            });
        // $state.go('app.instalaciones');
      },
      function () {
        $scope.$parent.$parent.functions.notificacion('Error al hacer Login', 'red');
      });
    }

    function toAjustes () {
      config.backView = $state.current.name;
      $state.go('app.ajustes');
    }
  }

})();