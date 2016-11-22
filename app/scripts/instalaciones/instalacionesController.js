(function() {
  'use strict';

  angular
    .module('app.instalaciones')
    .controller('instalacionesController', instalaciones);

  instalaciones.$inject = ['$scope', '$window', '$log', '$state', '$timeout', 'dataService', 'config', 'instalacionFactory', 'instalacionesFactory'];

  function instalaciones ($scope, $window, $log, $state, $timeout, dataService, config, instalacion, instalaciones) {
    $log.log('Instalaciones');

    var vm = this;

// VIEW MODEL
    vm.heightMapa = ($window.innerHeight-43).toString() + "px";

    vm.instalaciones = instalaciones.instalaciones;
    vm.vistaMapa = true;


    vm.functions = {
      irADetalle: irADetalle
      // submit: submit
    };
// VARIABLES DEL MAPA (LEAFLET)
    angular.extend($scope, {

      layers: {
        baselayers: {
          principal: {
            name: 'Google Streets',
            layerType: 'ROADMAP',
            type: 'google'
          }
        },
        overlays: {
          capaInstalaciones: {
            type: 'featureGroup',
            name: 'capaInstalaciones',
            visible: true
          }
        }
      },

      centro: {
        lat: 40.06641,
        lng: -2.14533,
        zoom: 8
      },

      icons: {
        markerInstalacion: instalaciones.markerInstalacion
      },

      markers: instalaciones.markers,

      controls: {
        scale: {
          options: {
            visible: true
          }

        }
      }
    });

    activate();

// FUNCIONES
    function activate () {
      if (!config.getLoginStatus()) {
        $state.go('app.login');
      }

      $timeout(function () {
        vm.vistaMapa = false;
      }, 150);
      if (!instalaciones.instalacionesCargadas) {
        dataService.getData("instalaciones/")
          .then
          (function (Data) {
            // $log.log(Data);
            instalaciones.instalacionesCargadas = true;
            instalaciones.instalaciones = Data.data.results;
            vm.instalaciones = instalaciones.instalaciones;
            instalaciones.newMarkerInst();
          },
          function (e) {
            $log.warn('error al cargar instalaciones: ' + e.data.detail);
          });

        // Obtenemos las alarmas
        dataService.getData("alarmas/")
          .then
          (function (Data) {
            instalaciones.alarmas = Data.data;
          },
          function (e) {
            $log.warn('error al cargar alarmas: ' + e.data.detail);
          });
      }
        
    }

    function irADetalle (item) {
      instalacion.nombreInstActual = item.nombre;
      $state.go('app.fichaInstalacion.index', {id: item.id});
    }

// EVENTOS
    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      var instalacion = args.leafletEvent.target.options;
      irADetalle(instalacion);
    });
  }

})();