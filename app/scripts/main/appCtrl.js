(function() {
  'use strict';

    angular
        .module('app.main')
        .controller('appCtrl', appCtrl);

    appCtrl.$inject = ['$rootScope', '$scope', '$log', '$state', '$window', '$timeout', '$ionicPopup', '$ionicHistory', '$ionicSideMenuDelegate', 'config', 'dataService', 'instalacionFactory', 'instalacionesFactory'];

    function appCtrl($rootScope, $scope, $log, $state, $window, $timeout, $ionicPopup, $ionicHistory, $ionicSideMenuDelegate, config, dataService, instalacion, instalaciones) {

        //ionic.Platform.ready(function() {
        //    StatusBar.hide();
        //});

        var scope = $scope;
        scope.menuDraggable = false;

        scope.functions = {
            logOut: logOut,
            toAjustes: toAjustes,
            toInstalaciones: toInstalaciones,
            toUltimaInstalacion: toUltimaInstalacion,
            AcercaDe: AcercaDe,
            notificacion: notificacion,
            goBack: goBack,
            ultimaInstalacionVisible: ultimaInstalacionVisible
        };

        activate();
        //dataservice.logDispositivo().then(activate());

        function activate() {
            var perfil;
            if ($window.localStorage["perfilUsuario"] && $window.localStorage["perfilUsuario"] !== "null") {
                perfil = JSON.parse($window.localStorage["perfilUsuario"]);
                config.setUrlToken(perfil.urlToken);
                config.setUrlWS(perfil.urlWS);
                config.setLoginData(perfil.loginData);
                config.setPreferencias(perfil.preferencias);
                dataService.login(config.getLoginData())
                    .then
                    (function () {
                        if (config.preferencias.mostrarInstalacion) {
                            dataService.getData("instalaciones/")
                                .then
                                (function (Data) {
                                    // $log.log(Data);
                                    instalaciones.instalacionesCargadas = true;
                                    instalaciones.instalaciones = Data.data.results;
                                    instalaciones.newMarkerInst();
                                    instalacion.nombreInstActual = instalaciones.getInstalacionPorId(parseInt(config.preferencias.idInstalacion, 10)).nombre;
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
                        // $window.alert('login incorrecto');
                        $state.go('app.login');
                        scope.functions.notificacion('Error al hacer Login', 'red');
                    });
            }else{
                $state.go('app.login');
            }

        }

        function logOut () {
            delete $window.localStorage["perfilUsuario"]
            // $window.localStorage["perfilUsuario"] = null;
            config.resetData();
            instalaciones.resetInstalaciones();
            instalacion.resetInstalacion();

            var timer = $timeout(function() {
                $state.go('app.login');
                $timeout.cancel(timer);
            }, 200);
        }

        function toAjustes () {
            config.backView = $state.current.name;
            $state.go('app.ajustes');
        }

        function toInstalaciones () {
            config.backView = $state.current.name;
            $state.go('app.instalaciones');
        }

        function toUltimaInstalacion () {
            if (instalacion.instalacion.id || instalacion.instalacion.id === 0) {
                $state.go('app.fichaInstalacion.index', {id: instalacion.instalacion.id});
            }
            else{
                scope.functions.notificacion('Todavía no has visitado ninguna Instalación', 'red');
            }

        }

        function AcercaDe () {
            // config.backView = $state.current.name;
            $state.go('app.acercaDe');
        }

        function notificacion (msg, color) {

            var myPopup = $ionicPopup.show({
                template: "<style>.popup .popup-buttons,.popup .popup-body{ display: none; } .popup-container .popup-head{border: none;} .popup h3{font-size: 20px; color: white} .popup-container .popup{background-color: " + color + "; border-radius: 6px;}</style>",
                title: msg
            });
            var timer = $timeout(function() {
                myPopup.close();
                $timeout.cancel(timer);
            }, 1500);
        }

        function goBack () {
          $state.go('app.fichaInstalacion.index');
        }

        function ultimaInstalacionVisible() {
            return !$state.includes('app.fichaInstalacion') ;
        }

        $scope.$on('$ionicView.enter', function(){
                var timer = $timeout(function() {
                    if (config.getLoginStatus() && 
                        ($state.current.name === 'app.instalaciones' ||
                        $state.current.name === 'app.acercaDe' ||
                        $state.current.name === 'app.login' ||
                        $state.current.name === 'app.ajustes') ) {
                        $ionicHistory.clearHistory();
                        $ionicSideMenuDelegate.$getByHandle('menuPrincipal').canDragContent(true);
                    }
                    else {
                        $ionicHistory.clearHistory();
                        $ionicSideMenuDelegate.$getByHandle('menuPrincipal').canDragContent(false);
                    }             
                    $timeout.cancel(timer);
                }, 200);
        });

    }

})();
