(function() {
  'use strict';

  angular
    .module('app.agentes')
    .controller('agentesController', agentes);

  agentes.$inject = ['$scope', '$timeout', '$interval', '$log', '$filter', '$state', '$window', '$ionicPopup', '$ionicScrollDelegate', '$socket', 'leafletData', 'instalacionFactory', 'nivelesInstalacionFactory', 'agenteFactory', 'dataService', 'utilidades', 'config'];

  function agentes ($scope, $timeout, $interval, $log, $filter, $state, $window, $ionicPopup, $ionicScrollDelegate, $socket, leafletData, instalacion, nivelesInstalacion, agente, dataService, util, config) {
    $log.log('Agentes');
    var scopeMapa = $scope.$parent.$parent;
    var locFingerprinting = null;
    var copiaNumeroMedidas = null;
    var copiaNumeroMuestrasExploracion = null;
    var contadorActual = 0;//tomará el valor del numero de muestras de exploración o del número de muestras de captura según el modo
    var modo = null;
    var modos = {
      exploracion: {
        id: 0
      },
      captura: {
        id: 1
      }
    };
    var distanciasRoutersExploracion = {};

    var vm = this;

    vm.mapaVisible = true;
    vm.filtrar = '';
    
    vm.nombreInstalacion = instalacion.instalacion.nombre;

    vm.vista = 'Listado de Agentes';
    vm.agentes = [];
    vm.agente = {};

    vm.sensor = {};

  // fingerprinting 
    vm.codigoLocalizadorFingerprinting = '';
    vm.numeroMedidas = 100;
    vm.numeroMuestrasExploracion = 5;
    vm.detalleAnalisis = 2;
    vm.posicionLocalizador = {
      lat: 0,
      lng: 0,
    };
    vm.muestrasIncluidas = false;
    vm.localizadorSeleccionado = false;
    vm.exploracionTerminada = false
    vm.localizadorNoEncontrado = false;
    vm.localizadorPosicionado = false;
    vm.explorando = false;
    vm.capturando = false;

    vm.routerExploracion = {
      indice: 0,
      router: '',
      distancia: 0
    };

    vm.titulo = vm.vista + "  ";

    vm.functions = {
      toListaAgentes: toListaAgentes,
      toDetAgente: toDetAgente,
      toPartials: toPartials,
      activarFingerprinting: activarFingerprinting,
      buscarLocalizador: buscarLocalizador,
      moverLocalizador: moverLocalizador,
      empezarExploracion: empezarExploracion,
      empezarCaptura: empezarCaptura,
      pararCaptura: pararCaptura,
      resetFingerprinting: resetFingerprinting,
      transformDate: util.transformDate,
      transformDate2: util.transformDate2,
      onDragUp: onDragUp,
      onDragDown: onDragDown,
      resizeScroll: resizeScroll,
      tieneSensor: tieneSensor,
    };

    activate();

  // FUNCIONES
    function activate() {
      if (!config.getLoginStatus()) {
        $state.go('app.login');
      }
      vm.agentes = $filter('filter')(instalacion.agentes, {planta: nivelesInstalacion.plantaActual.id});
      scopeMapa.layersFicha.overlays.capaRouters.visible = false;
      scopeMapa.layersFicha.overlays.capaLocalizadores.visible = false;
      scopeMapa.layersFicha.overlays.capaActuadores.visible = false;
      scopeMapa.vm.btnPlantasVisible = false;

      if (agente.init.desdeMapa) {
        vm.functions.toDetAgente(agente.init.id, agente.init.indice);
        agente.init = {
          desdeMapa: false,
          id: null,
          indice: null
        };
      }
    }

    function toListaAgentes () {
      vm.vista = 'Listado de Agentes';
      vm.titulo = vm.vista;
      $ionicScrollDelegate.scrollTop();
      if (vm.agente.indice || vm.agente.indice === 0) {
        instalacion.markers['agente'+vm.agente.indice].icon.iconSize = [45,45];
        instalacion.markers['agente'+agente.agente.indice].icon.iconAnchor = [26,45];
      }
      else{
        scopeMapa.vm.infoVisible = false;
      }
      aCentroMapa();
    }

    function toDetAgente (id, indice) {
      vm.vista = 'Detalle del Agente';
      if (id) {
        dataService.getData("agentes/" + id + "/")
          .then
          (function (Data) {
            Data.data.indice = indice;//valor que tiene en los markers
            agente.agente = Data.data;
            vm.agente = Data.data;
            vm.titulo = vm.vista + " : " + vm.agente.nombre;
            $ionicScrollDelegate.scrollTop();
            if (indice || indice === 0) {
              if (instalacion.agentes[indice].planta !== nivelesInstalacion.plantaActual.id) {
                var plantaAgente = nivelesInstalacion.getPlantaPorId(instalacion.agentes[indice].planta);
                scopeMapa.vm.functions.cambioDePlanta(plantaAgente.planta);
              }

              leafletData.getMap('mapa2').then(function (map) {
                var timer = $interval(function() {
                  if (instalacion.markers['agente'+indice]) {
                    instalacion.centro.lat = parseFloat(vm.agente.posicion.split(',')[0]);
                    instalacion.centro.lng = parseFloat(vm.agente.posicion.split(',')[1]);
                    map.setView([
                        instalacion.centro.lat,
                        instalacion.centro.lng
                      ],
                      instalacion.centro.zoom
                    );
                    instalacion.markers['agente'+indice].icon.iconSize = [70,70];
                    instalacion.markers['agente'+indice].icon.iconAnchor = [35,70];
                      
                    $interval.cancel(timer);
                  }
                }, 200);
              });  
            }
            else{
              scopeMapa.centroFicha = instalacion.centro;
              scopeMapa.vm.infoVisible = true;
            }

            if (vm.agente.tieneSensor) {
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
            $log.warn('error al cargar agente: ' + e.data.detail);
          });
      }else{
        vm.titulo = vm.vista + " : " + vm.agente.nombre;
        $ionicScrollDelegate.scrollTop();
      }
      
    }

    function toPartials (vista) {
      if (vm.vista === 'Calibración Fingerprinting') {
        resetFingerprinting();
      }
      vm.vista = vista;
      vm.titulo = vm.vista + " : " + vm.agente.nombre;;
      $ionicScrollDelegate.scrollTop();
    }

    function activarFingerprinting () {
      scopeMapa.layersFicha.overlays.fingerprinting.visible = true;
      vm.muestrasIncluidas = true;
    }

    function buscarLocalizador () {
      for (var i = 0; i < instalacion.localizadores.length; i++) {
        if (instalacion.localizadores[i].codigo === vm.codigoLocalizadorFingerprinting) {
          locFingerprinting = angular.copy(instalacion.localizadores[i].codigo);
          break;
        }
      }
      if (locFingerprinting) {
        vm.localizadorSeleccionado = true;
        vm.localizadorNoEncontrado = false;
      }
      else {
        vm.localizadorNoEncontrado = true;
      }
    }

    function moverLocalizador (campo, valor) {
      instalacion.fingerprinting[campo] = vm.posicionLocalizador[campo] = instalacion.fingerprinting[campo] + valor;
    }

    function empezarExploracion () {
      if (vm.numeroMuestrasExploracion > 0) {
        modo = modos.exploracion;
        copiaNumeroMuestrasExploracion = angular.copy(vm.numeroMuestrasExploracion);
        empezarCaptura();
      }
      else {
        vm.exploracionTerminada = true;
      }
    }

    function empezarCaptura () {
      if ($socket.getState()) {
        $socket.close();
      }
      if (!modo) {
        modo = modos.captura;
        copiaNumeroMedidas = angular.copy(vm.numeroMedidas);
      }
      
      if (agente.socketAgente.idAgente !== vm.agente.id) {
        // loguear y abrir socket
        dataService.loginAgente(vm.agente.ip + '/login')
          .then(function (response) {
              agente.socketAgente.tokenAgente = response.data.token;
              agente.socketAgente.idAgente = vm.agente.id;
              agente.socketAgente.wsAgenteActivo = true;
              $socket.start(vm.agente.ip + '/ws');
          },
          function (e) {
              scopeMapa.$parent.functions.notificacion('Error al hacer Login en el agente', 'red');
          });
      }
      else {
        $timeout(function () {
          agente.socketAgente.wsAgenteActivo = true;
          $socket.start(vm.agente.ip + '/ws');
        },200);
      }
    }

    function pararCaptura () {
      if (modo.id === 0) {
        agente.socketAgente.wsAgenteActivo = false;
        $socket.emit('dejar', {Id: parseInt(vm.codigoLocalizadorFingerprinting, 16)}, true);
        $socket.close();
        modo = null;
        vm.explorando = false;
        vm.numeroMuestrasExploracion = copiaNumeroMuestrasExploracion;
        incluirDistancia();
      }
      else if (modo.id === 1) {
        $log.debug(agente.datosCaptura);
        var url = vm.agente.ip + '/api/v1/detener_fingerprinting';
        var data = {
          'numero_de_muestras': copiaNumeroMedidas,
          'localizador': vm.codigoLocalizadorFingerprinting,
          'coordenadas': vm.posicionLocalizador.lat.toString() + ',' + vm.posicionLocalizador.lng.toString(),
          'numero_de_muestras_capturadas': agente.datosCaptura.length,
          'detalle_analisis': vm.detalleAnalisis
        }
        dataService.sendDataAgente(url, data, agente.socketAgente.tokenAgente)
          .then(function () {
              agente.socketAgente.wsAgenteActivo = false;
              $socket.emit('dejar', {Id: parseInt(vm.codigoLocalizadorFingerprinting, 16)}, true);
              $socket.close();
              modo = null;
              vm.capturando = false;
              vm.numeroMedidas = copiaNumeroMedidas;
          },
          function (e) {
              scopeMapa.$parent.functions.notificacion('Error al parar captura', 'red');
          });
      }   
    }

    function resetFingerprinting () {
      locFingerprinting = null;
      copiaNumeroMedidas = null;
      copiaNumeroMuestrasExploracion = null;
      modo = null;
      vm.codigoLocalizadorFingerprinting = '';
      vm.numeroMedidas = 100;
      vm.posicionLocalizador = {
        lat: 0,
        lng: 0,
      };
      vm.muestrasIncluidas = false;
      vm.localizadorSeleccionado = false;
      vm.localizadorNoEncontrado = false;
      vm.localizadorPosicionado = false;
      scopeMapa.layersFicha.overlays.fingerprinting.visible = false;
      delete instalacion.markers['locFingerprinting'];
      instalacion.fingerprinting.drawed = false;
      agente.socketAgente.wsAgenteActivo = false;
      vm.explorando = false;
      vm.capturando = false;
      vm.exploracionTerminada = false;
      distanciasRoutersExploracion = {};
      vm.routerExploracion.indice = 0;
      vm.routerExploracion.router = '';
      vm.routerExploracion.distancia = 0;
      if ($socket.getState()) {
        $socket.emit('dejar', {Id: parseInt(vm.codigoLocalizadorFingerprinting, 16)}, true);
        $socket.close();
      }
      
      $timeout(function () {
        $socket.start(config.urlWS);
      },200);
        
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

    function incluirDistancia () {
      var indexUltimaCaptura = (agente.datosCaptura.length-1);
      if (vm.routerExploracion.indice < agente.datosCaptura[indexUltimaCaptura].valoresRssi.length) {
        vm.routerExploracion.router = agente.datosCaptura[indexUltimaCaptura].valoresRssi[vm.routerExploracion.indice].idRouter;
        vm.routerExploracion.distancia = 0;
        abrirPopUpDistancia();
      }
      else {
        vm.exploracionTerminada = true;
      }
    }

    function abrirPopUpDistancia () {
      var titulo = 'Router ' + vm.routerExploracion.router;
      var myPopup = $ionicPopup.show({
        template: '<input type="number" step="0.001" ng-model="vm.routerExploracion.distancia">',
        title: titulo,
        subTitle: 'Por favor introduzca distancia al router',
        scope: $scope,
        buttons: [
          { 
            text: 'Cancelar',
            type: 'button-assertive'
          },
          {
            text: '<b>Guardar</b>',
            type: 'button-balanced',
            onTap: function(e) {
              return $scope.vm.routerExploracion.distancia;
            }
          }
        ]
      });
      myPopup.then(function(res) {
        if (res) {
          distanciasRoutersExploracion[vm.routerExploracion.router] = vm.routerExploracion.distancia.toString();
        }
        vm.routerExploracion.indice++;
        incluirDistancia();
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
          vm.agente = {};
          $timeout.cancel(timer);
        });
      });
    }

  // EVENTOS
    $scope.$on('$stateChangeStart', function() {
      // reseteamos marcadores
      if ($state.current.name === 'app.fichaInstalacion.agentes' && vm.vista !== 'Listado de Agentes') {
        if (vm.agente.indice || vm.agente.indice === 0) {
          instalacion.markers['agente'+vm.agente.indice].icon.iconSize = [45,45];
          instalacion.markers['agente'+vm.agente.indice].icon.iconAnchor = [26,45];
        }
        else{
          scopeMapa.vm.infoVisible = false;
        }
        aCentroMapa();
      }

      //reseteamos capas de los marcadores
      scopeMapa.layersFicha.overlays.capaRouters.visible = true;
      scopeMapa.layersFicha.overlays.capaLocalizadores.visible = true;
      scopeMapa.layersFicha.overlays.capaActuadores.visible = true;
      scopeMapa.vm.btnPlantasVisible = true;

      //reseteamos alturas
      if (!scopeMapa.vm.mapaVisible) {
        scopeMapa.vm.heightContent = (($window.innerHeight-43)/2).toString() + "px";
        scopeMapa.vm.displayMapa = 'block';
        scopeMapa.vm.mapaVisible = true;
      }
      
      // reseteamos fingerprinting
      resetFingerprinting();
      
      //reseteamos variables de inicio desde el mapa
      agente.init = {
        desdeMapa: false,
        id: null,
        indice: null
      };
        
    });

    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      if ($state.current.name === 'app.fichaInstalacion.agentes') {
        var _agente = args.leafletEvent.target.options;
        if (_agente.id !== vm.agente.id) {
          if (vm.agente.indice || vm.agente.indice === 0) {
            instalacion.markers['agente'+vm.agente.indice].icon.iconSize = [45,45];
            instalacion.markers['agente'+vm.agente.indice].icon.iconAnchor = [26,45];
          }
          else{
            scopeMapa.vm.infoVisible = false;
          }
          
          vm.functions.toDetAgente(_agente.id, _agente.indice);
        }
      }
        
    });

    $scope.$on('LocFingerprinting', function (e, posicion) {
      vm.posicionLocalizador.lat = posicion.lat;
      vm.posicionLocalizador.lng = posicion.lng;
      vm.localizadorPosicionado = true;
    });

    $scope.$on('open', function(event, data){
      if (agente.socketAgente.wsAgenteActivo) {
        $log.log("Web socket Conectado...");
        if (!vm.capturando && !vm.explorando) {
          if (modo.id === 0) {
            $timeout(function () {
              vm.explorando = true;
              agente.datosCaptura = [];
              $socket.emit('subscribir', {Id: parseInt(vm.codigoLocalizadorFingerprinting, 16)}, true);
            });
              
          }
          else if (modo.id === 1) {
            var url = vm.agente.ip + '/api/v1/iniciar_fingerprinting';
            var data = {
              'numero_de_muestras': vm.numeroMedidas,
              'localizador': vm.codigoLocalizadorFingerprinting,
              'coordenadas': vm.posicionLocalizador.lat.toString() + ',' + vm.posicionLocalizador.lng.toString(),
              'dispositivos_alcance': distanciasRoutersExploracion,
              'detalle_analisis': vm.detalleAnalisis
            }
            
            dataService.sendDataAgente(url, data, agente.socketAgente.tokenAgente)
              .then(function () {
                  vm.capturando = true;
                  agente.datosCaptura = [];
                  $socket.emit('subscribir', {Id: parseInt(vm.codigoLocalizadorFingerprinting, 16)}, true);
              },
              function (e) {
                  scopeMapa.$parent.functions.notificacion('Error al iniciar captura', 'red');
              }); 
            }
        }
        else {
          $socket.emit('subscribir', {Id: parseInt(vm.codigoLocalizadorFingerprinting, 16)}, true);
        }
          
      }
         
    }, $scope);

    $socket.on('nueva_posicion', function(event, data){
      if (agente.socketAgente.wsAgenteActivo) {
        contadorActual = (modo.id === 0) ? angular.copy(vm.numeroMuestrasExploracion) : angular.copy(vm.numeroMedidas);
        if (contadorActual > 0) {
          $log.log('nueva posición');
          agente.datosCaptura.push(data);
          (modo.id === 0) ? vm.numeroMuestrasExploracion-- : vm.numeroMedidas--;
        }
        if (contadorActual === 0) {
          contadorActual = 0;
          pararCaptura();
        }
      }
    }, $scope);

  }

})();