(function() {
  'use strict';

  angular
    .module('app.alarmas')
    .controller('alarmasController', alarmas);

  alarmas.$inject = ['$scope', '$log', '$state', '$window', '$filter', '$ionicScrollDelegate', 'dataService', 'config', 'instalacionFactory', 'utilidades'];

  function alarmas ($scope, $log, $state, $window, $filter, $ionicScrollDelegate, dataService, config, instalacion, util, router, localizador, agente, actuador) {
    $log.log('Alarmas');
    var scopeMapa = $scope.$parent.$parent;

    var vm = this;

    vm.mapaVisible = true;

    vm.nombreInstalacion = instalacion.instalacion.nombre;

    vm.alarmas = instalacion.alarmas;
    vm.alarma = null;
    vm.vista = 'Listado de Alarmas';

    vm.functions = {
      toListaAlarmas: toListaAlarmas,
      toDetAlarma: toDetAlarma,
      irADispositivo: irADispositivo,
      MonitorizarAlarma: MonitorizarAlarma,
      onDragUp: onDragUp,
      onDragDown: onDragDown,
      transformDate: util.transformDate,
      transformDate2: util.transformDate2,
    };

    activate();

  // FUNCIONES
    function activate() {
      if (!config.getLoginStatus()) {
        $state.go('app.login');
      }
      scopeMapa.vm.btnPlantasVisible = false;
    }

    function toListaAlarmas (actualizarLista) {
      $ionicScrollDelegate.scrollTop();
      if (actualizarLista) {
        dataService.getData("instalaciones/" + instalacion.instalacion.id + "/alarmas/historico/")
          .then(function (alarmas) {
            alarmas.data = $filter('orderBy')(alarmas.data, 'fechaInicioAlarma', true);
            instalacion.alarmas = alarmas.data;
            vm.alarmas = instalacion.alarmas;
          },
          function (e) {
            $log.warn('error al obtener los sensores');
          });
      }
      vm.vista = 'Listado de Alarmas';
      vm.alarma = null;
    }

    function toDetAlarma (indice) {
      vm.vista = 'Detalle de Alarma';
      vm.alarma = vm.alarmas[indice];      
    }

    function irADispositivo (indice) {
      var tipoListaDispositivos = '';
      var dispositivo = {
        nombre_tipo: vm.alarma.nombre_tipo_dispositivo,
        id: vm.alarma.dispositivo
      }
      switch(vm.alarma.nombre_tipo_dispositivo) {
        case 'Router':
            tipoListaDispositivos = 'routers';
            break;
        case 'Localizador':
            tipoListaDispositivos = 'localizadores';
            break;
        case 'Agente WSN' || 'Coordinador':
            tipoListaDispositivos = 'agentes';
        case 'Actuador':
            tipoListaDispositivos = 'actuadores';
            break;
      }
      for (var i = 0; i < instalacion[tipoListaDispositivos].length; i++) {
        if (instalacion[tipoListaDispositivos][i].id === vm.alarma.dispositivo) {
          dispositivo.indice = instalacion[tipoListaDispositivos][i].indice;
        }
      }
      scopeMapa.vm.functions.aDetalleDispositivoDesdeMapa(dispositivo);    
    }

    function MonitorizarAlarma (indice) {
      var url = 'alarmas/historico/' + vm.alarma.id + '/';
      var metodo = 'PATCH'
      var data = {"monitorizadaPorElAdmin": true};
      dataService.sendData(url, data, metodo)
        .then(function (Data) {
            toListaAlarmas(true);
        },
        function (e) {
          $log.warn('error monitorizando alarma');
        });
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