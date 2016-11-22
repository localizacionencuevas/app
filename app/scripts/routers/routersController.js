(function() {
  'use strict';

  angular
    .module('app.routers')
    .controller('routersController', routers);

  routers.$inject = ['$scope', '$log', '$timeout', '$interval', '$filter', '$state', '$window', '$ionicScrollDelegate', 'leafletData', 'config', 'instalacionFactory', 'nivelesInstalacionFactory', 'routerFactory', 'localizadorFactory', 'dataService', 'utilidades'];

  function routers ($scope, $log, $timeout, $interval, $filter, $state, $window, $ionicScrollDelegate, leafletData, config, instalacion, nivelesInstalacion, router, localizador, dataService, util) {
    $log.log('Routers');
    var scopeMapa = $scope.$parent.$parent;

    var cambioALocalizador = false;//para anular el cambio de centro al cambiar de estado porque da problemas en el digest del mapa

    var vm = this;

    // vm.mapaVisible = true;
    vm.filtrar = '';

    vm.nombreInstalacion = instalacion.instalacion.nombre;

    vm.vista = 'Listado de Routers';
    vm.routers = [];
    vm.router = {};
    vm.valorSintetico = 0;
    vm.calibracion = 20;
    vm.botonActivo = true;

    vm.sensor = {};

    vm.titulo = vm.vista + "  ";

    vm.functions = {
      toListaRouters: toListaRouters,
      toDetRouter: toDetRouter,
      toPartials: toPartials,
      calibrar: calibrar,
      cambioCalibracion: cambioCalibracion,
      irALocalizador: irALocalizador,
      transformDate: util.transformDate,
      transformDate2: util.transformDate2,
      onDragUp: onDragUp,
      onDragDown: onDragDown,
      resizeScroll: resizeScroll,
      tieneSensor: tieneSensor
    };

    activate();

  // FUNCIONES
    function activate() {
      if (!config.getLoginStatus()) {
        $state.go('app.login');
      }
      vm.routers = $filter('filter')(instalacion.routers, {planta: nivelesInstalacion.plantaActual.id});
      scopeMapa.layersFicha.overlays.capaLocalizadores.visible = false;
      scopeMapa.layersFicha.overlays.capaAgentes.visible = false;
      scopeMapa.layersFicha.overlays.capaActuadores.visible = false;
      scopeMapa.vm.btnPlantasVisible = false;

      if (router.init.desdeMapa) {
        vm.functions.toDetRouter(router.init.id, router.init.indice);
        router.init = {
          desdeMapa: false,
          id: null,
          indice: null
        };
      }
    }

    function toListaRouters () {
      vm.vista = 'Listado de Routers';
      vm.titulo = vm.vista;
      $ionicScrollDelegate.scrollTop();
      if (vm.router.indice || vm.router.indice === 0) {
        instalacion.markers['router'+vm.router.indice].icon.iconSize = [45,45];
        instalacion.markers['router'+router.router.indice].icon.iconAnchor = [26,45];
      }
      else{
        scopeMapa.vm.infoVisible = false;
      }
      aCentroMapa();

    }

    function toDetRouter (id, indice) {
      vm.vista = 'Detalle del Router';
      if (id) {
        dataService.getData("routers/" + id + "/")
          .then
          (function (Data) {
            Data.data.indice = indice;//valor que tiene en los markers
            router.router = Data.data;
            vm.router = router.router;
            vm.valorSintetico = angular.copy(router.router.valor_sintetico);
            vm.calibracion = parseFloat(angular.copy(router.router.calibracion));
            vm.titulo = vm.vista + " : " + vm.router.nombre;
            $ionicScrollDelegate.scrollTop();
            if (indice || indice === 0) {
              if (instalacion.routers[indice].planta !== nivelesInstalacion.plantaActual.id) {
                var plantaRouter = nivelesInstalacion.getPlantaPorId(instalacion.routers[indice].planta);
                scopeMapa.vm.functions.cambioDePlanta(plantaRouter.planta);
              }

              leafletData.getMap('mapa2').then(function (map) {
                var timer = $interval(function() {
                  if (instalacion.markers['router'+indice]) {
                    instalacion.centro.lat = parseFloat(vm.router.posicion.split(',')[0]);
                    instalacion.centro.lng = parseFloat(vm.router.posicion.split(',')[1]);
                    map.setView([
                        instalacion.centro.lat,
                        instalacion.centro.lng
                      ],
                      instalacion.centro.zoom
                    );
                    instalacion.markers['router'+indice].icon.iconSize = [70,70];
                    instalacion.markers['router'+indice].icon.iconAnchor = [35,70];
                      
                    $interval.cancel(timer);
                  }
                }, 200);
              });  
              
            }
            else{
              scopeMapa.centroFicha = instalacion.centro;
              scopeMapa.vm.infoVisible = true;
            }

            if (vm.router.tieneSensor) {
              for (var i = 0; i < instalacion.sensores.length; i++) {
                if (instalacion.sensores[i].id === id) {
                  vm.sensor = instalacion.sensores[i];
                }
              }
            }
            else {
              vm.sensor = {};
            }
              
          },
          function (e) {
            $log.warn('error al cargar router: ' + e.data.detail);
          });
      }else{
        vm.titulo = vm.vista + " : " + vm.router.nombre;
        $ionicScrollDelegate.scrollTop();
      }
      
    }

    function toPartials (vista) {
      vm.vista = vista;
      vm.titulo = vm.vista + " : " + vm.router.nombre;;
      $ionicScrollDelegate.scrollTop();
    }

    function calibrar () {
          var url = 'instalaciones/'+ instalacion.instalacion.id +'/nodos_fijos/';
          var datos = JSON.stringify({
            Id: vm.router.codigo,
            calibracion: vm.calibracion,
            valor_sintetico: vm.valorSintetico
          });

          dataService.sendData(url, datos, "POST")
            .success(function (nodo) {
              vm.botonActivo = false;
            })
            .error(function (error){
              $log.log("error al enviar calibracion");
            });
    }

    function cambioCalibracion () {
      if (!vm.botonActivo) {
        vm.botonActivo = true;
      }
    }

    function irALocalizador (id) {
      var _index;
      for (var i = 0; i < instalacion.localizadores.length; i++) {
        if (instalacion.localizadores[i].id === id) {
          _index = instalacion.localizadores[i].indice;
        }
      }

      cambioALocalizador = true;
      localizador.init.desdeMapa = true;
      localizador.init.id = id;
      localizador.init.indice = _index;
      $state.go('app.fichaInstalacion.localizadores');
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

    function aCentroMapa () {
      leafletData.getMap('mapa2').then(function (map) {
        var timer = $timeout(function() {
          map.setView([
              instalacion.centroInicial.lat,
              instalacion.centroInicial.lng
            ],
            instalacion.centro.zoom
          );
          vm.router = {};
          $timeout.cancel(timer);
        });
      });
    }

  // EVENTOS
    $scope.$on('$stateChangeStart', function() {
      // reseteamos marcadores
      if ($state.current.name === 'app.fichaInstalacion.routers' && vm.vista !== 'Listado de Routers') {
        if (vm.router.indice || vm.router.indice === 0) {
          instalacion.markers['router'+vm.router.indice].icon.iconSize = [45,45];
          instalacion.markers['router'+vm.router.indice].icon.iconAnchor = [26,45];
        }
        else{
          scopeMapa.vm.infoVisible = false;
        }

        if (!cambioALocalizador) {
          aCentroMapa();
          cambioALocalizador = false;
        }
      }

      //reseteamos capas de los marcadores y la infoSinPosicion
      scopeMapa.layersFicha.overlays.capaLocalizadores.visible = true;
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
      router.init = {
        desdeMapa: false,
        id: null,
        indice: null
      };
        
    });

    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      if ($state.current.name === 'app.fichaInstalacion.routers') {
        var _router = args.leafletEvent.target.options;
        if (_router.id !== vm.router.id) {
          if (vm.router.indice || vm.router.indice === 0) {
            instalacion.markers['router'+vm.router.indice].icon.iconSize = [45,45];
            instalacion.markers['router'+vm.router.indice].icon.iconAnchor = [26,45];
          }
          else{
            scopeMapa.vm.infoVisible = false;
          }
                  
          vm.functions.toDetRouter(_router.id, _router.indice);
        }
      }
        
    });

  }

})();