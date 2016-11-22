(function() {
  'use strict';

  angular
    .module('app.routers')
    .controller('localizadoresController', localizadores);

  localizadores.$inject = ['$scope', '$log', '$timeout', '$interval', '$filter', '$state', '$window', '$ionicScrollDelegate', 'leafletData', 'instalacionFactory', 'nivelesInstalacionFactory', 'localizadorFactory', 'dataService', 'utilidades', 'config'];

  function localizadores ($scope, $log, $timeout, $interval, $filter, $state, $window, $ionicScrollDelegate, leafletData, instalacion, nivelesInstalacion, localizador, dataService, util, config) {
    $log.log('Localizadores');
    var scopeMapa = $scope.$parent.$parent;

    var vm = this;

    vm.mapaVisible = true;
    vm.filtrar = '';

    vm.nombreInstalacion = instalacion.instalacion.nombre;

    vm.vista = 'Listado de Localizadores';
    vm.localizadores = instalacion.localizadores;
    vm.localizador = {};
    vm.alarmas = [];
    vm.ultimasPosiciones = [];
    // vm.intensidad = 55;

    vm.sensor = {};

    vm.titulo = vm.vista + "  ";

    vm.functions = {
      toListaLocalizadores: toListaLocalizadores,
      toDetLocalizador: toDetLocalizador,
      toPartials: toPartials,
      obtenerRouter: obtenerRouter,
      transformDate: util.transformDate,
      transformDate2: util.transformDate2,
      getLatitud: util.getLatitud,
      getLongitud: util.getLongitud,
      onDragUp: onDragUp,
      onDragDown: onDragDown,
      resizeScroll: resizeScroll,
      tieneSensor: tieneSensor,
      getPosicionPadre: getPosicionPadre
    };

    activate();

  // FUNCIONES
    function activate() {
      if (!config.getLoginStatus()) {
        $state.go('app.login');
      }
      // vm.localizadores = $filter('filter')(instalacion.localizadores, {planta: nivelesInstalacion.plantaActual.id});
      scopeMapa.layersFicha.overlays.capaRouters.visible = false;
      scopeMapa.layersFicha.overlays.capaAgentes.visible = false;
      scopeMapa.layersFicha.overlays.capaActuadores.visible = false;
      scopeMapa.vm.btnPlantasVisible = false;

      if (localizador.init.desdeMapa) {
        vm.functions.toDetLocalizador(localizador.init.id, localizador.init.indice);
        localizador.init = {
          desdeMapa: false,
          id: null,
          indice: null
        };
      }
    }

    function toListaLocalizadores () {
      vm.vista = 'Listado de Localizadores';
      vm.titulo = vm.vista;
      $ionicScrollDelegate.scrollTop();
      if (instalacion.localizadores[vm.localizador.indice].drawed) {
        instalacion.markers['localizador'+vm.localizador.indice].icon.iconSize = [45,45];
        instalacion.markers['localizador'+localizador.localizador.indice].icon.iconAnchor = [26,45];
      }
      else{
        scopeMapa.vm.infoVisible = false;
      }
      aCentroMapa();

    }

    function toDetLocalizador (id, indice) {
      var copiaCapaLocalizadores = angular.copy(scopeMapa.vm.capaLocalizadores);
      vm.vista = 'Detalle del Localizador';
      if (id) {
        delete scopeMapa.layersFicha.overlays.capaLocalizadores;
        scopeMapa.markersFicha = {};
        dataService.getData("localizadores/" + id + "/")
          .then
          (function (Data) {
            Data.data.indice = indice;//valor que tiene en los markers
            localizador.localizador = Data.data;
            vm.localizador = localizador.localizador;
            vm.titulo = vm.vista + " : " + vm.localizador.nombre;
            vm.alarmas = instalacion.localizadores[indice].alarmas;
            vm.ultimasPosiciones = localizador.ultimasPosiciones();
            $ionicScrollDelegate.scrollTop();
            scopeMapa.layersFicha.overlays.capaLocalizadores = copiaCapaLocalizadores;
            // if (indice || indice === 0) {
            if (instalacion.localizadores[indice].drawed) {
              if (instalacion.localizadores[indice].planta !== nivelesInstalacion.plantaActual.id) {
                var plantaLocalizador = nivelesInstalacion.getPlantaPorId(instalacion.localizadores[indice].planta);
                scopeMapa.vm.functions.cambioDePlanta(plantaLocalizador.planta);
              }
              else{
                scopeMapa.markersFicha = instalacion.markers;
              }

              leafletData.getMap('mapa2').then(function (map) {
                var timer = $interval(function() {
                  if (instalacion.markers['localizador'+indice]) {
                    instalacion.centro.lat = parseFloat(vm.localizador.posicion.split(',')[0]);
                    instalacion.centro.lng = parseFloat(vm.localizador.posicion.split(',')[1]);
                    map.setView([
                        instalacion.centro.lat,
                        instalacion.centro.lng
                      ],
                      instalacion.centro.zoom
                    );
                    instalacion.markers['localizador'+indice].icon.iconSize = [70,70];
                    instalacion.markers['localizador'+indice].icon.iconAnchor = [35,70];
                      
                    $interval.cancel(timer);
                  }
                }, 200);
              });
            }
            else{
              scopeMapa.centroFicha = instalacion.centro;
              scopeMapa.vm.infoVisible = true;
            }

            if (vm.localizador.tieneSensor) {
              for (var i = 0; i < instalacion.sensores.length; i++) {
                if (instalacion.sensores[i].id === id) {
                  vm.sensor = instalacion.sensores[i];
                  break;
                }
              }
            }
            else {
              vm.sensor = {};
            }

          },
          function (e) {
            $log.warn('error al cargar instalaciones: ' + e.data.detail);
          });
      }else{
        vm.titulo = vm.vista + " : " + vm.localizador.nombre;
        $ionicScrollDelegate.scrollTop();
      }
      
    }

    function toPartials (vista) {
      vm.vista = vista;
      vm.titulo = vm.vista + " : " + vm.localizador.nombre;;
      $ionicScrollDelegate.scrollTop();
    }

    function obtenerRouter (codigoRouter) {
      for (var i = 0; i < instalacion.routers.length; i++) {
        if (instalacion.routers[i].codigo === codigoRouter) {
          return instalacion.routers[i].nombre;
        }
      }
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

    function resizeScroll () {
      $ionicScrollDelegate.resize();
    }

    function tieneSensor (c) {
      var flag = c ? "Si" : "No";
      return flag;
    }

    function getPosicionPadre (idPadre) {
      for (var i = 0; i < instalacion.routers.length; i++) {
        if (instalacion.routers[i].id === idPadre) {
          return instalacion.routers[i].posicion;
        }
      }
    }

    function aCentroMapa () {
      var copiaCapaLocalizadores = angular.copy(scopeMapa.vm.capaLocalizadoresCluster);
      delete scopeMapa.layersFicha.overlays.capaLocalizadores;
      scopeMapa.markersFicha = {};
      leafletData.getMap('mapa2').then(function (map) {
        var timer = $timeout(function() {
          scopeMapa.layersFicha.overlays.capaLocalizadores = copiaCapaLocalizadores;
          scopeMapa.markersFicha = instalacion.markers;
          map.setView([
              instalacion.centroInicial.lat,
              instalacion.centroInicial.lng
            ],
            instalacion.centro.zoom
          );
          vm.localizador = {};
          scopeMapa.layersFicha.overlays.capaLocalizadores.layerOptions.disableClusteringAtZoom = 1;
          $timeout.cancel(timer);
        });
      });
    }

  // EVENTOS
    $scope.$on('$stateChangeStart', function() {
      // reseteamos marcadores
      if ($state.current.name === 'app.fichaInstalacion.localizadores' && vm.vista !== 'Listado de Localizadores') {
        // if (vm.localizador.indice || vm.localizador.indice === 0) {
        if (instalacion.localizadores[vm.localizador.indice].drawed) {
          instalacion.markers['localizador'+vm.localizador.indice].icon.iconSize = [45,45];
          instalacion.markers['localizador'+vm.localizador.indice].icon.iconAnchor = [26,45];
        }else{
          scopeMapa.vm.infoVisible = false;
        }
        aCentroMapa();
      }

      //reseteamos capas de los marcadores
      scopeMapa.layersFicha.overlays.capaRouters.visible = true;
      scopeMapa.layersFicha.overlays.capaAgentes.visible = true;
      scopeMapa.layersFicha.overlays.capaActuadores.visible = true;
      scopeMapa.vm.btnPlantasVisible = true;
      
      //reseteamos alturas
      if (!scopeMapa.vm.mapaVisible) {
        scopeMapa.vm.heightContent = (($window.innerHeight-43)/2).toString() + "px";
        scopeMapa.vm.displayMapa = 'block';
        scopeMapa.vm.mapaVisible = true;
      }
      
      //reseteamos variables de inicio desde el mapa
      localizador.init = {
        desdeMapa: false,
        id: null,
        indice: null
      };
    });

    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      if ($state.current.name === 'app.fichaInstalacion.localizadores') {
        var _localizador = args.leafletEvent.target.options;
        if (_localizador.id !== vm.localizador.id) {
          if (vm.localizador.id && instalacion.localizadores[vm.localizador.indice].drawed) {
            instalacion.markers['localizador'+vm.localizador.indice].icon.iconSize = [45,45];
            instalacion.markers['localizador'+vm.localizador.indice].icon.iconAnchor = [26,45];
          }else{
            scopeMapa.vm.infoVisible = false;
          }
          
          vm.functions.toDetLocalizador(_localizador.id, _localizador.indice);
        }
      }
        
    });

  }

})();