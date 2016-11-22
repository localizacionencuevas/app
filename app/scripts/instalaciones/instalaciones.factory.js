(function() {
  'use strict';

  angular
  .module('app.instalaciones')
  .factory('instalacionesFactory', instFactory);

  function instFactory() {
    // var _urlToken = 'https://agrfid.servinet.net';

    var factory = {
      instalaciones: [],
      instalacionesCargadas: false,
      alarmas: [],
      markers: {},
      markerInstalacion: {
          iconUrl: 'images/Puntointeresrojo.png',
          shadowUrl: 'images/vacio.png',
          iconSize: [45, 45], // size of the icon
          iconAnchor: [26, 45], // point of the icon which will correspond to marker's location
          //popupAnchor:  [-26, -45], // point from which the popup should open relative to the iconAnchor
          className: "Usuario",
        },
      newMarkerInst: newMarkerInst,
      resetInstalaciones: resetInstalaciones,
      getInstalacionPorId: getInstalacionPorId
    };

    return factory;

// FUNCIONES
    function newMarkerInst () {
        for (var i = 0; i < factory.instalaciones.length; i++) {
          factory.instalaciones[i].layer =  'capaInstalaciones';
          factory.instalaciones[i].lat =  parseFloat(factory.instalaciones[i].posicion.split(',')[0]);
          factory.instalaciones[i].lng =  parseFloat(factory.instalaciones[i].posicion.split(',')[1]);
          factory.instalaciones[i].icon = factory.markerInstalacion;
          factory.markers['instalacion'+i] = factory.instalaciones[i];
        }
    }

    function resetInstalaciones () {
      factory.instalaciones = [];
      factory.instalacionesCargadas = false;
      factory.alarmas = [];
      factory.markers = {};
    }

    function getInstalacionPorId (id) {
      var instalacion = null;
      for (var i = 0; i < factory.instalaciones.length; i++) {
        if (factory.instalaciones[i].id === id) {
          instalacion = factory.instalaciones[i];
          break;
        }
      }
      return instalacion;
    }
  }

})();