(function() {
  'use strict';

  angular
  .module('app.fichaInstalacion')
  .factory('instalacionFactory', instFactory);

  instFactory.$inject = ['config', 'nivelesInstalacionFactory'];
  function instFactory(config, nivelesInstalacion) {
    var iconActuador;

    var factory = {
    //Scope
      idInstalacion: null,
      instalacion: {},
      nombreInstActual: '',
      instalacionCargada: false,
      mapaInterior: false,
      centroInicial: {},

      alarmas: [],
      sensores: [],

      routers: [],
      localizadores: [],
      agentes: [],
      actuadores: [],

      fingerprinting: {},

      //almacenamos las posiciones y distribucion de los LOCALIZADORES para pintarlos sin que se solapen
      posiciones: [],
      locPorPosicion: {},

      totalDispositivos: 0,
      totalRouters: 0,
      totalLocalizadores: 0,
      totalAgentes: 0,
      totalActuadores: 0,

    //Icono actuador encendido
      iconActuadorActivado: 'images/bombillaNew2ON.png',
      iconAlarmaLocalizador: 'images/localizadorWarning.png',

    //Mapa
      defaults: {},

      layer: {},

      centro: {},

      maxbounds: {},

      controls: {},

      markers: {},

  //Funciones
      newMarkerDisp: newMarkerDisp,
      getIconActuador: getIconActuador,
      alarmaEnLocalizador: alarmaEnLocalizador,
      localizadorApagadoCorrecto: localizadorApagadoCorrecto,
      posicionLocalizadorFingerprinting: posicionLocalizadorFingerprinting,
      resetInstalacion: resetInstalacion,
      dibujarRouters: dibujarRouters,
      dibujarAgentes: dibujarAgentes,
      dibujarActuadores: dibujarActuadores,
      dibujarLocalizadores: dibujarLocalizadores
    };

    return factory;

// FUNCIONES
    function newMarkerDisp () {
      factory.markers = {};
      var iconRouter, iconLocalizador, iconAgente; 
      for (var a = 0; a < factory.instalacion.tipos_dispositivos.length; a++) {
        if (factory.instalacion.tipos_dispositivos[a].nombre === 'Router') {
          iconRouter = factory.instalacion.tipos_dispositivos[a].icono_url;
        }
        else if (factory.instalacion.tipos_dispositivos[a].nombre === 'Localizador') {
          iconLocalizador = factory.instalacion.tipos_dispositivos[a].icono_url;
        }
        else if (factory.instalacion.tipos_dispositivos[a].nombre === 'Actuador') {
          iconActuador = factory.instalacion.tipos_dispositivos[a].icono_url;
        }
        else if (factory.instalacion.tipos_dispositivos[a].nombre === 'Agente WSN') {
          iconAgente = factory.instalacion.tipos_dispositivos[a].icono_url;
        }
      }

    // FINGERPRINTING EN AGENTES
      factory.fingerprinting = {
        layer: 'fingerprinting',
        lat: 0,
        lng: 0,
        drawed: false,
        icon: {
          iconSize: [50, 50],
          iconUrl: config.urlToken + iconLocalizador,
          shadowUrl: 'images/vacio.png',
          iconAnchor: [28, 50],
          className: "localizador"
        }
      }
      
    //MARCADORES ROUTERS 
      var indiceRouter = 0; 
      for (var i = 0; i < factory.routers.length; i++) {
        if (factory.routers[i].posicion !== "0,0") {
          var marker = {iconSize: [45, 45], shadowUrl: 'images/vacio.png', iconAnchor: [26, 45], className: "router"};
          factory.routers[i].layer =  'capaRouters';
          factory.routers[i].lat =  parseFloat(factory.routers[i].posicion.split(',')[0]);
          factory.routers[i].lng =  parseFloat(factory.routers[i].posicion.split(',')[1]);
          factory.routers[i].indice = indiceRouter;
          factory.routers[i].nodosDependientes = [];
          factory.routers[i].icon = marker;
          factory.routers[i].icon.iconUrl = config.urlToken + iconRouter;
          if (factory.routers[i].planta === nivelesInstalacion.plantaActual.id) {
            factory.markers['router'+indiceRouter] = factory.routers[i];
          }

          indiceRouter++;
        }
      }
  
            
    //MARCADORES AGENTES  
      var indiceAgente = 0;
      for (var k = 0; k < factory.agentes.length; k++) {
        if (factory.agentes[k].posicion !== "0,0") {
          var marker = {iconSize: [45, 45], shadowUrl: 'images/vacio.png', iconAnchor: [26, 45], className: "agente"};
          factory.agentes[k].layer =  'capaAgentes';
          factory.agentes[k].lat =  parseFloat(factory.agentes[k].posicion.split(',')[0]);
          factory.agentes[k].lng =  parseFloat(factory.agentes[k].posicion.split(',')[1]);
          factory.agentes[k].indice = indiceAgente;
          factory.agentes[k].icon = marker;
          factory.agentes[k].icon.iconUrl = config.urlToken + iconAgente;
          if (factory.agentes[k].planta === nivelesInstalacion.plantaActual.id) {
            factory.markers['agente'+indiceAgente] = factory.agentes[k];
          }

          indiceAgente++;
        }
      }
      
    //MARCADORES ACTUADORES 
      var indiceActuador = 0; 
      for (var x = 0; x < factory.actuadores.length; x++) {
        if (factory.actuadores[x].posicion !== "0,0") {
          var marker = {iconSize: [45, 45], shadowUrl: 'images/vacio.png', iconAnchor: [26, 45], className: "actuador"};
          factory.actuadores[x].layer =  'capaActuadores';
          factory.actuadores[x].lat =  parseFloat(factory.actuadores[x].posicion.split(',')[0]);
          factory.actuadores[x].lng =  parseFloat(factory.actuadores[x].posicion.split(',')[1]);
          factory.actuadores[x].indice = indiceActuador;
          factory.actuadores[x].icon = marker;
          factory.actuadores[x].icon.iconUrl = factory.actuadores[x].propiedades.activado ? factory.iconActuadorActivado : config.urlToken + iconActuador;
          if (factory.actuadores[x].planta === nivelesInstalacion.plantaActual.id) {
            factory.markers['actuador'+indiceActuador] = factory.actuadores[x];
          }

          indiceActuador++;
        }
      }
      
    //MARCADORES LOCALIZADORES 
      var indiceLocalizador = 0; 
      for (var j = 0; j < factory.localizadores.length; j++) {
        var marker = {iconSize: [45, 45], shadowUrl: 'images/vacio.png', iconAnchor: [26, 45], className: "localizador"};
        factory.localizadores[j].layer =  'capaLocalizadores';
        factory.localizadores[j].lat =  parseFloat(factory.localizadores[j].posicion.split(',')[0]);
        factory.localizadores[j].lng =  parseFloat(factory.localizadores[j].posicion.split(',')[1]);
        factory.localizadores[j].indice = indiceLocalizador;
        factory.localizadores[j].zIndexOffset = 1000;
        factory.localizadores[j].depende = '';
        factory.localizadores[j].alarmas = [];
        factory.localizadores[j].icon = marker;
        factory.localizadores[j].icon.iconUrl = config.urlToken + iconLocalizador;
        factory.localizadores[j].drawed = false;

        indiceLocalizador++;
      }

    }

    function getIconActuador () {
      return (config.urlToken + iconActuador);
    }

    function alarmaEnLocalizador (alarma) {
      var indice;
      var campo = alarma.id ? 'id' : 'codigo';
      for (var i = 0; i < factory.localizadores.length; i++) {
        if (factory.localizadores[i][campo] === alarma[campo]) {
          indice = i;
          break;
        }
      }
      if (indice || indice === 0) {
        var alarmaIncluida = false;
        for (var j = 0; j < factory.localizadores[indice].alarmas.length; j++) {
          if (factory.localizadores[indice].alarmas[j].evento === alarma.evento) {
            alarmaIncluida = true;
            factory.localizadores[indice].alarmas[j].numeroAlarmasProducidas++;
            break;
          }
        }
        if (!alarmaIncluida) {
          alarma.numeroAlarmasProducidas = 1;
          factory.localizadores[indice].icon.iconUrl = factory.iconAlarmaLocalizador;
          factory.localizadores[indice].alarmas.push(alarma);
        }
      }      
    }

    function dibujarRouters () {
      for (var i = 0; i < factory.routers.length; i++) {
        if (factory.routers[i].planta === nivelesInstalacion.plantaActual.id && 
          (factory.routers[i].indice || factory.routers[i].indice === 0)) {
          factory.markers['router'+factory.routers[i].indice] = factory.routers[i];
        }
      }
    }

    function dibujarAgentes () {
      for (var i = 0; i < factory.agentes.length; i++) {
        if (factory.agentes[i].planta === nivelesInstalacion.plantaActual.id && 
          (factory.agentes[i].indice || factory.agentes[i].indice === 0)) {
          factory.markers['agente'+factory.agentes[i].indice] = factory.agentes[i];
        }
      }
    }

    function dibujarActuadores () {
      for (var i = 0; i < factory.actuadores.length; i++) {
        if (factory.actuadores[i].planta === nivelesInstalacion.plantaActual.id && 
          (factory.actuadores[i].indice || factory.actuadores[i].indice === 0)) {
          factory.markers['actuador'+factory.actuadores[i].indice] = factory.actuadores[i];
        }
      }
    }

    function dibujarLocalizadores () {
      for (var i = 0; i < factory.localizadores.length; i++) {
        if (factory.localizadores[i].planta === nivelesInstalacion.plantaActual.id && factory.localizadores[i].indice) {
          factory.markers['localizador'+factory.localizadores[i].indice] = factory.localizadores[i];
        }
      }
    }


    function localizadorApagadoCorrecto (index) {
      factory.localizadores[index].drawed = false;
      delete factory.markers['localizador'+index];
    }

    function posicionLocalizadorFingerprinting (lat, lng) {
      factory.fingerprinting.lat = lat;
      factory.fingerprinting.lng = lng;
      if (!factory.fingerprinting.drawed) {
        factory.markers['locFingerprinting'] = factory.fingerprinting;
      }
    }

    function resetInstalacion () {
      factory.idInstalacion = null;
      factory.instalacion = {};
      factory.instalacionCargada = false;
      factory.mapaInterior = false;
      factory.alarmas = [];
      factory.sensores = [];
      factory.routers = [];
      factory.localizadores = [];
      factory.agentes = [];
      factory.actuadores = [];
      factory.posiciones = [];
      factory.locPorPosicion = {};
      factory.totalDispositivos = 0;
      factory.totalRouters = 0;
      factory.totalLocalizadores = 0;
      factory.totalAgentes = 0;
      factory.totalActuadores = 0;
      factory.defaults = {};
      factory.layer = {};
      factory.centro = {};
      factory.maxbounds = {};
      factory.controls = {};
      factory.markers = {};
      factory.fingerprinting = {};
    }

  }

})();