(function() {
  'use strict';

  angular
    .module('app.fichaInstalacion')
    .controller('mapaInstalacionCtrl', mapaInstalacion);

  mapaInstalacion.$inject = ['$scope', '$rootScope', '$log', '$state', '$timeout', '$window', '$filter', '$stateParams', '$socket', 'dataService', 'initInstalacion', 'instalacionFactory', 'nivelesInstalacionFactory', 'instalacionesFactory', 'localizacionFactory', 'routerFactory', 'localizadorFactory', 'agenteFactory', 'actuadorFactory', 'config'];

  function mapaInstalacion ($scope, $rootScope, $log, $state, $timeout, $window, $filter, $stateParams, $socket, dataService, initInstalacion, instalacion, nivelesInstalacion, instalaciones, localizacion, router, localizador, agente, actuador, config) {
    $log.log('Ficha Instalacion');    
    var id = $stateParams.id;

// INICIALIZACION DE LOS VALORES DEL MAPA,
// SE HACE AQUI PARA QUE NO DE PROBLEMAS Y UTILIZAR LAS DIRECTIVAS DE LEAFLET CORRECTAMENTE
    var init = initInstalacion.init($stateParams.id);
      

    var vm = this;
    vm.capaLocalizadores = {
      type: 'featureGroup',
      name: 'capaLocalizadores',
      visible: true
    };
    vm.capaLocalizadoresCluster = {
      type: 'markercluster',
      name: 'capaLocalizadores',
      visible: true,
      layerOptions: {
        disableClusteringAtZoom: 1,
        iconCreateFunction: function (cluster) {
          var childCount = cluster.getChildCount();
          var c = '';
          if (childCount < 10) {
              c = '-small';
          }
          else {
              c = '-medium';
          }

          return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster-wsn' + c, iconSize: new L.Point(50, 45) });
        }
      }
    };

// VIEW MODEL
    vm.id = null;
    vm.instalacion = instalacion.instalacion;

    vm.plantasInstalacion = nivelesInstalacion.getPlantasInstalacion();
    vm.plantaActualInstalacion = nivelesInstalacion.plantaActual;
    vm.btnPlantasVisible = true;
    vm.menuPlantasVisible = false;

    vm.heightMapa = (($window.innerHeight-43)/2).toString() + "px";
    vm.displayMapa = 'block';
    vm.mapaVisible = true;
    vm.instalacionCargada = false;
    vm.heightContent = (($window.innerHeight-43)/2).toString() + "px";
    // vm.heightPanel = (((($window.innerHeight-43)/2) - 93)/2).toString() + "px";

    vm.onDragUp = false;
    vm.onDragDown = false;

    // vm.alarmasPendientes = false;
    // vm.textoAlarmas = 'Sin Alarmas Pendientes';

    vm.infoVisible = false;
    vm.textoInfo = '';

    vm.functions = {
      onDragUp: onDragUp,
      onDragDown: onDragDown,
      aDetalleDispositivoDesdeMapa: aDetalleDispositivoDesdeMapa,
      upVisible: upVisible,
      colorInfo: colorInfo,
      cambioDePlanta: cambioDePlanta,
      refrescarInstalacion: refrescarInstalacion
    };

// // VARIABLES DEL MAPA (LEAFLET)
    angular.extend($scope, {

      layersFicha: {
        baselayers: {
          principal: instalacion.layer
        },
        overlays: {
          capaRouters: {
            type: 'featureGroup',
            name: 'capaRouters',
            visible: true
          },
          capaAgentes: {
            type: 'featureGroup',
            name: 'capaAgentes',
            visible: true
          },
          capaActuadores: {
            type: 'featureGroup',
            name: 'capaActuadores',
            visible: true
          },
          fingerprinting: {
            type: 'featureGroup',
            name: 'fingerprinting',
            visible: false
          },
          // capaLocalizadores: {
          //   type: 'featureGroup',
          //   name: 'capaLocalizadores',
          //   visible: true
          // },
          capaLocalizadores: angular.copy(vm.capaLocalizadoresCluster)
        }
      },

      centroFicha: instalacion.centro,

      defaultsFicha: instalacion.defaults,

      maxboundsFicha: instalacion.maxbounds,

      iconsFicha: {
        markerInstalacion: instalacion.markerInstalacion
      },

      markersFicha: instalacion.markers,

      controlsFicha: instalacion.controls
    });


    activate();

// FUNCIONES

    function activate () {
      if (!init) {
        $state.go('app.login');
      }
      vm.id = parseInt(id, 10);

      if (!instalacion.instalacionCargada || vm.id !== instalacion.idInstalacion) {
        instalacion.idInstalacion = vm.id;

        //Obtenemos la instalación
        dataService.getData("instalaciones/" + id + "/")
          .then
          (function (Data) {
            Data.data.lat =  parseFloat(Data.data.posicion.split(',')[0]);
            Data.data.lng =  parseFloat(Data.data.posicion.split(',')[1]);
            instalacion.instalacionCargada = true;
            instalacion.instalacion = Data.data;
            instalacion.totalDispositivos = Data.data.n_dispositivos;
            instalacion.dispositivos = Data.data.dispositivos;
            establecerTotales(Data.data.dispositivos);
            if (!$socket.getState()) {
              $socket.start(config.urlWS);
            }

            $timeout(function () {
              vm.instalacion = instalacion.instalacion;
              instalacion.newMarkerDisp();
              $scope.markersFicha = instalacion.markers;
              vm.instalacionCargada = true;
              $scope.$broadcast('instalacionCargada');
            });
          },
          function (e) {
            $log.warn('error al cargar instalaciones: ' + e.data.detail);
          });

        dataService.getData("instalaciones/" + id + "/alarmas/historico/")
          .then(function (alarmas) {
            alarmas.data = $filter('orderBy')(alarmas.data, 'fechaInicioAlarma', true);
            instalacion.alarmas = alarmas.data;
            var alarmasData = {};
            alarmasData.alarmasPendientes = (alarmas.data.length > 0) ? true : false;
            alarmasData.textoAlarmas = (alarmas.data.length > 0) ? 'Hay Alarmas Pendientes' : 'Sin Alarmas Pendientes';
            $scope.$broadcast('alarmasCargadas', alarmasData);
          },
          function (e) {
            $log.warn('error al obtener los sensores');
          });

        dataService.getData("instalaciones/" + id + "/sensores/")
          .then
          (function (data) {
            instalacion.sensores = [];
            for (var j = 0; j < data.data.length; j++) {
              var sensor = angular.copy(data.data[j]);
              var tempUpdated = false;
              var humUpdated = false;
              var temp;
              var hum;
              sensor.indice = j;

              for (var k = 0; k < sensor.ultimas_lecturas.length; k++) {
                if (sensor.ultimas_lecturas[k].propiedadDispositivo === 'Humedad' && !humUpdated) {
                  hum = sensor.ultimas_lecturas[k].valor;
                  humUpdated = true;
                }
                else if (sensor.ultimas_lecturas[k].propiedadDispositivo === 'Temperatura' && !tempUpdated) {
                  temp = sensor.ultimas_lecturas[k].valor;
                  tempUpdated = true;
                }
              }
              sensor.temp = tempUpdated ? temp : "-";
              sensor.hum = humUpdated ? hum : "-";
              instalacion.sensores.push(sensor);
            }
          },
        function (e) {
          $log.warn('error al obtener los sensores');
        });

        //Obtenemos los sensores
      }
      else {
        $socket.start(config.urlWS);
      }
      config.backView = $state.current.name;
    }

    function onDragUp () {
      if (vm.mapaVisible) {
        vm.onDragUp = true;
        // vm.displayMapa = 'none';

        $timeout(function () {
          vm.onDragUp = false;
          // vm.vistaMapa = false;
          vm.heightContent = ($window.innerHeight-43).toString() + "px";
          // vm.displayMapa = 'none';
          vm.mapaVisible = false;
        }, 300); 

      }
      
    }

    function onDragDown () {
      if (!vm.mapaVisible) {
        vm.onDragDown = true;
        // vm.displayMapa = 'block';

        $timeout(function () {
          vm.onDragDown = false;
          // vm.vistaMapa = false;
          vm.heightContent = (($window.innerHeight-43)/2).toString() + "px";
          vm.displayMapa = 'block';
          vm.mapaVisible = true;
        }, 300);
      }
    }

    function aDetalleDispositivoDesdeMapa (dispositivo) {
      switch(dispositivo.nombre_tipo) {
        case 'Router':
            router.init.desdeMapa = true;
            router.init.id = dispositivo.id;
            router.init.indice = dispositivo.indice;
            $state.go('app.fichaInstalacion.routers');
            break;
        case 'Localizador':
            localizador.init.desdeMapa = true;
            localizador.init.id = dispositivo.id;
            localizador.init.indice = dispositivo.indice;
            $state.go('app.fichaInstalacion.localizadores');
            break;
        case 'Agente WSN':
            agente.init.desdeMapa = true;
            agente.init.id = dispositivo.id;
            agente.init.indice = dispositivo.indice;
            $state.go('app.fichaInstalacion.agentes');
            break;
        case 'Actuador':
            actuador.init.desdeMapa = true;
            actuador.init.id = dispositivo.id;
            actuador.init.indice = dispositivo.indice;
            $state.go('app.fichaInstalacion.actuadores');
            break;
      }
    }

    function establecerTotales (dispositivos) {
      instalacion.routers = [];
      instalacion.localizadores = [];
      instalacion.agentes = [];
      instalacion.actuadores = [];

      instalacion.posiciones = [];
      instalacion.locPorPosicion = {};

      instalacion.totalRouters = 0;
      instalacion.totalLocalizadores = 0;
      instalacion.totalAgentes = 0;
      instalacion.totalActuadores = 0;

      for (var i = 0; i < instalacion.instalacion.n_dispositivos; i++) {
        if (dispositivos[i].nombre_tipo === 'Router') {
          instalacion.routers.push(dispositivos[i]);
          instalacion.totalRouters++;
        }

        //los localizadores los Introducimos al crear los marcadores excepto los no posicionados
        if (dispositivos[i].nombre_tipo === 'Localizador') {
          instalacion.localizadores.push(dispositivos[i]);
          instalacion.totalLocalizadores++;

        // EL siguiente código es para pintar todos los localizadores y sin funcionalidad de localización
          // if (dispositivos[i].posicion !== "0,0") {
          //   if (instalacion.posiciones.length > 0) {
          //     var long = instalacion.posiciones.length;
          //     var incluido = false;
          //     var indx = 0;
          //     for (var j = 0; j < long; j++) {
          //       if (instalacion.posiciones[j] === dispositivos[i].posicion) {
          //         incluido = true; indx = j+1;
          //       }
          //     }
          //     if (incluido) {
          //       instalacion.locPorPosicion["pos"+indx].push(dispositivos[i])
          //       incluido = false;
          //       indx = 0;
          //     }
          //     else{
          //       var a = long+1;
          //       instalacion.posiciones.push(dispositivos[i].posicion);
          //       instalacion.locPorPosicion["pos"+a] = [];
          //       instalacion.locPorPosicion["pos"+a].push(dispositivos[i]);
          //     }

          //   }
          //   else{
          //     instalacion.posiciones.push(dispositivos[i].posicion);
          //     instalacion.locPorPosicion["pos1"] = [];
          //     instalacion.locPorPosicion["pos1"].push(dispositivos[i]);
          //   }
          // }

        }
        if (dispositivos[i].nombre_tipo === 'Agente WSN') {
          instalacion.agentes.push(dispositivos[i]);
          instalacion.totalAgentes++;
        }
        if (dispositivos[i].nombre_tipo === 'Actuador') {
          instalacion.actuadores.push(dispositivos[i]);
          instalacion.totalActuadores++;
        }
        if (dispositivos[i].nombre_tipo === 'Coordinador' || dispositivos[i].nombre_tipo === 'Pavimento Inteligente') {
            instalacion.totalDispositivos--;
            vm.totalDispositivos = instalacion.totalDispositivos;
        }
      }
    }

    function upVisible () {
      return ($state.includes('app.fichaInstalacion.index') || vm.onDragDown);
    }

    function colorInfo () {
      if ($state.includes('app.fichaInstalacion.routers')) {
        vm.textoInfo = 'Este router no está posicionado';
        return ('sp-router');
      }
      else if ($state.includes('app.fichaInstalacion.localizadores')) {
        vm.textoInfo = 'Este localizador está apagado';
        return ('sp-localizador');
      }
      else if ($state.includes('app.fichaInstalacion.agentes')) {
        vm.textoInfo = 'Este agente no está posicionado';
        return ('sp-agente');
      }
      else if ($state.includes('app.fichaInstalacion.actuadores')) {
        vm.textoInfo = 'Este actuador no está posicionado';
        return ('sp-actuador');
      }
      else{
        return '';
      }
    }

    function cambioDePlanta (planta) {
      if (vm.plantaActualInstalacion.planta !== planta) {
        nivelesInstalacion.setPlantaActual(planta);
        initInstalacion.initPlanta();
        vm.instalacionCargada = false;
        vm.plantaActualInstalacion = nivelesInstalacion.plantaActual;
        delete $scope.layersFicha.baselayers.principal;
        delete $scope.maxboundsFicha;
        $timeout(function(){
          vm.instalacionCargada = true;
          $scope.layersFicha.baselayers.principal = instalacion.layer;
          $scope.maxboundsFicha = instalacion.maxbounds;
          $scope.centroFicha = instalacion.centro;
          $scope.markersFicha = instalacion.markers;
        }, 60);
      }
    };

    function refrescarInstalacion () {
      instalacion.instalacionCargada = false;
      if ($state.current.name !== 'app.fichaInstalacion.index') {
        $state.go('app.fichaInstalacion.index');
      }
      
      $timeout(function () {
        if ($socket.getState()) {
          $socket.close();
        }
        activate();
      },300);
    };

// EVENTOS    
    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      var dispositivo = args.leafletEvent.target.options;
      vm.menuPlantasVisible = false;
      aDetalleDispositivoDesdeMapa(dispositivo);
    });

    $scope.$on('leafletDirectiveMap.click', function (e, args) {
      vm.menuPlantasVisible = false;
      if ($state.current.name === 'app.fichaInstalacion.agentes' && $scope.layersFicha.overlays.fingerprinting.visible) {
        instalacion.posicionLocalizadorFingerprinting(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng);
        var posicion = {lat:args.leafletEvent.latlng.lat, lng:args.leafletEvent.latlng.lng}
        $scope.$broadcast('LocFingerprinting', posicion);
      }
    });

    $scope.$on('open', function(event, data){
      if (!agente.socketAgente.wsAgenteActivo) {
        $log.log("Web socket Conectado...");

        var canal = {"canal": instalacion.idInstalacion};
        dataService.sendTokenWS(canal)
          .success(function (datos) {
            if (datos.token_ws) {
              config.tokenWS = datos.token_ws;
              $socket.emit(config.tokenWS, {'channel': instalacion.idInstalacion.toString()});
              //$log.log(datos.token_ws);
            }
          })
          .error(function (error){
          });
        }
    }, $scope);

    $socket.on('nueva_posicion', function(event, data){
      if (!agente.socketAgente.wsAgenteActivo) {
        $log.log('nueva posición');
        localizacion.actualizarPosicion(data)
      }
        

    }, $scope);

    $socket.on('nueva_alarma', function(event, datos){
      var item;
      var alarma = {}
      switch(datos.name) {
        case 'alarma_2_posiciones':
          alarma.evento = "Localizador separado dos posiciones";
          alarma.id = datos.localizador;
          alarma.fecha = datos.fecha;
          break;
        case 'alarma_caida':
          alarma.evento = "El usuario ha sufrido una caida";
          alarma.id = datos.localizador;
          alarma.fecha = datos.fecha;
          break;
        case 'nueva_alarma':
          $log.debug(datos.datos.mensaje);
          alarma.evento = datos.datos.mensaje;
          alarma.codigo = datos.datos.codigo;
          alarma.fecha = datos.datos.fecha;
          break;
        case 'apagado_correcto':
          for (var i = 0; i < instalacion.localizadores.length; i++) {
            if (instalacion.localizadores[i].id === datos.localizador && instalacion.localizadores[i].drawed) {
              if ($state.current.name === 'app.fichaInstalacion.localizadores' && localizador.localizador === datos.localizador) {
                $state.go('app.fichaInstalacion.index');
                $scope.$parent.functions.notificacion('Localizador ' + instalacion.localizadores[i].codigo + ' desconectado correctamente', 'red');
              }
              instalacion.localizadorApagadoCorrecto(instalacion.localizadores[i].indice);
              break;
            }
          }
          break;
        case 'cambiar_estado_actuador':
          for (var i = 0; i < instalacion.actuadores.length; i++) {
            if (instalacion.actuadores[i].id === datos.actuador) {
              item = instalacion.actuadores[i];
            }
          }

          if (item) {
            instalacion.actuadores[item.indice].propiedades.activado = datos.estado_actuador;
            if ($state.current.name === 'app.fichaInstalacion.actuadores') {
              $scope.$broadcast('actualizarActivado', datos.estado_actuador);
            }

            if (datos.estado_actuador && item) {
              $scope.markersFicha['actuador'+item.indice].icon.iconUrl = instalacion.iconActuadorActivado;
            }
            else if (!datos.estado_actuador && item) {
              $scope.markersFicha['actuador'+item.indice].icon.iconUrl = instalacion.getIconActuador();
            }
          }
          break;
      }
      if (alarma.evento) { instalacion.alarmaEnLocalizador(alarma); }
    }, $scope);

    $rootScope.$on('$stateChangeSuccess', function (event){
      if ($state.current.name === 'app.instalaciones' ||
        $state.current.name === 'app.acercaDe' ||
        $state.current.name === 'app.login' ||
        $state.current.name === 'app.ajustes') {

        $socket.close();
        vm.menuPlantasVisible = false;
      }
    });
  }

})();
  