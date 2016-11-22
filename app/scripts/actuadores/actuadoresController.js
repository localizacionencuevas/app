(function() {
  'use strict';

  angular
    .module('app.actuadores')
    .controller('actuadoresController', actuadores);

  actuadores.$inject = ['$scope', '$log', '$timeout', '$interval', '$filter', '$state', '$window', '$ionicScrollDelegate', 'leafletData', 'instalacionFactory', 'nivelesInstalacionFactory', 'actuadorFactory', 'dataService', 'utilidades', 'config'];

  function actuadores ($scope, $log, $timeout, $interval, $filter, $state, $window, $ionicScrollDelegate, leafletData, instalacion, nivelesInstalacion, actuador, dataService, util, config) {
    $log.log('Actuadores');
    var scopeMapa = $scope.$parent.$parent;


    var vm = this;

    vm.mapaVisible = true;
    vm.filtrar = '';

    vm.nombreInstalacion = instalacion.instalacion.nombre;

    vm.vista = 'Listado de Actuadores';
    vm.actuadores = [];
    vm.actuador = {};
    vm.encendido = null;
    vm.actuadorSinPosicion = false;

    vm.esperaConfirmar = false;

    vm.sensor = {};

    vm.titulo = vm.vista + "  ";

    vm.functions = {
      toListaActuadores: toListaActuadores,
      toDetActuador: toDetActuador,
      toPartials: toPartials,
      transformDate: util.transformDate,
      transformDate2: util.transformDate2,
      onDragUp: onDragUp,
      onDragDown: onDragDown,
      resizeScroll: resizeScroll,
      tieneSensor: tieneSensor,
      controlActuador: controlActuador
    };

    activate();

  // FUNCIONES
    function activate() {
      if (!config.getLoginStatus()) {
        $state.go('app.login');
      }
      vm.actuadores = $filter('filter')(instalacion.actuadores, {planta: nivelesInstalacion.plantaActual.id});
      scopeMapa.layersFicha.overlays.capaRouters.visible = false;
      scopeMapa.layersFicha.overlays.capaLocalizadores.visible = false;
      scopeMapa.layersFicha.overlays.capaAgentes.visible = false;
      scopeMapa.vm.btnPlantasVisible = false;

      if (actuador.init.desdeMapa) {
        vm.functions.toDetActuador(actuador.init.id, actuador.init.indice);
        actuador.init = {
          desdeMapa: false,
          id: null,
          indice: null
        };
      }
    }

    function toListaActuadores () {
      vm.vista = 'Listado de Actuadores';
      vm.titulo = vm.vista;
      $ionicScrollDelegate.scrollTop();
      if (vm.actuador.indice || vm.actuador.indice === 0) {
        instalacion.markers['actuador'+vm.actuador.indice].icon.iconSize = [45,45];
        instalacion.markers['actuador'+actuador.actuador.indice].icon.iconAnchor = [26,45];
      }
      else{
        scopeMapa.vm.infoVisible = false;
      }
      aCentroMapa();
    }

    function toDetActuador (id, indice) {
      vm.vista = 'Detalle del Actuador';
      if (id) {
        dataService.getData("actuadores/" + id + "/")
          .then
          (function (Data) {
            Data.data.indice = indice;//valor que tiene en los markers
            actuador.actuador = Data.data;
            vm.actuador = actuador.actuador;
            vm.encendido = vm.actuador.activado;
            vm.titulo = vm.vista + " : " + vm.actuador.nombre;
            $ionicScrollDelegate.scrollTop();
            if (indice || indice === 0) {
              vm.actuadorSinPosicion = false;
              if (instalacion.actuadores[indice].planta !== nivelesInstalacion.plantaActual.id) {
                var plantaActuador = nivelesInstalacion.getPlantaPorId(instalacion.actuadores[indice].planta);
                scopeMapa.vm.functions.cambioDePlanta(plantaActuador.planta);
              }

              leafletData.getMap('mapa2').then(function (map) {
                var timer = $interval(function() {
                  if (instalacion.markers['actuador'+indice]) {
                    instalacion.centro.lat = parseFloat(vm.actuador.posicion.split(',')[0]);
                    instalacion.centro.lng = parseFloat(vm.actuador.posicion.split(',')[1]);
                    map.setView([
                        instalacion.centro.lat,
                        instalacion.centro.lng
                      ],
                      instalacion.centro.zoom
                    );
                    instalacion.markers['actuador'+indice].icon.iconSize = [70,70];
                    instalacion.markers['actuador'+indice].icon.iconAnchor = [35,70];

                    if (vm.encendido !== instalacion.actuadores[indice].propiedades.activado) {
                      instalacion.actuadores[indice].propiedades.activado = vm.encendido;
                      if (vm.encendido) {
                        instalacion.markers['actuador'+indice].icon.iconUrl = instalacion.iconActuadorActivado;
                      }
                      else {
                        instalacion.markers['actuador'+indice].icon.iconUrl = instalacion.getIconActuador();
                      }
                    }
                      
                    $interval.cancel(timer);
                  }
                }, 200);
              });  

            }
            else{
              vm.actuadorSinPosicion = true;
              scopeMapa.centroFicha = instalacion.centro;
              scopeMapa.vm.infoVisible = true;
            }


            if (vm.actuador.tieneSensor) {
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
            $log.warn('error al cargar actuador: ' + e.data.detail);
          });
      }else{
        vm.titulo = vm.vista + " : " + vm.actuador.nombre;
        $ionicScrollDelegate.scrollTop();
      }
      
    }

    function toPartials (vista) {
      vm.vista = vista;
      vm.titulo = vm.vista + " : " + vm.actuador.nombre;;
      $ionicScrollDelegate.scrollTop();
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

    function controlActuador () {
      var url = 'instalaciones/' + instalacion.idInstalacion + '/valor_actuadores/';
      var datos = JSON.stringify({
        Id: vm.actuador.codigo,
        tipo: 3,
        fuente: 2,
        estado_actuador: !vm.encendido
      });

      dataService.sendData(url, datos, "POST")
        .success(function (nodo) {
          vm.esperaConfirmar = true;
        })
        .error(function (error){
          $log.log("error al activar/desactivar el actuador");
        });
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
          vm.actuador = {};
          $timeout.cancel(timer);
        });
      });
    }

    $scope.$on('$stateChangeStart', function() {
      // reseteamos marcadores
      if ($state.current.name === 'app.fichaInstalacion.actuadores' && vm.vista !== 'Listado de Actuadores') {
        if (vm.actuador.indice || vm.actuador.indice === 0) {
          instalacion.markers['actuador'+vm.actuador.indice].icon.iconSize = [45,45];
          instalacion.markers['actuador'+vm.actuador.indice].icon.iconAnchor = [26,45];
        }
        else{
          scopeMapa.vm.infoVisible = false;
        }
        aCentroMapa();
      }

      //reseteamos capas de los marcadores
      scopeMapa.layersFicha.overlays.capaRouters.visible = true;
      scopeMapa.layersFicha.overlays.capaLocalizadores.visible = true;
      scopeMapa.layersFicha.overlays.capaAgentes.visible = true;
      scopeMapa.vm.btnPlantasVisible = true;

      //reseteamos alturas
      if (!scopeMapa.vm.mapaVisible) {
        scopeMapa.vm.heightContent = (($window.innerHeight-43)/2).toString() + "px";
        scopeMapa.vm.displayMapa = 'block';
        scopeMapa.vm.mapaVisible = true;
      }
      
      //reseteamos variables de inicio desde el mapa      
      actuador.init = {
        desdeMapa: false,
        id: null,
        indice: null
      };
        
    });

    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      if ($state.current.name === 'app.fichaInstalacion.actuadores') {
        var _actuador = args.leafletEvent.target.options;
        if (_actuador.id !== vm.actuador.id) {
          if (vm.actuador.indice || vm.actuador.indice === 0) {
            instalacion.markers['actuador'+vm.actuador.indice].icon.iconSize = [45,45];
            instalacion.markers['actuador'+vm.actuador.indice].icon.iconAnchor = [26,45];
          }
          else{
            scopeMapa.vm.infoVisible = false;
          }
          
          vm.functions.toDetActuador(_actuador.id, _actuador.indice);
        }
      }
        
    });

    $scope.$on('actualizarActivado', function(event, data){
      vm.encendido = data;
      vm.esperaConfirmar = false;
    });

  }

})();