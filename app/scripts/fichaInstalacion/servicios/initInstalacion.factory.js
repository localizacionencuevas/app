(function() {
  'use strict';

	angular
		.module('app.fichaInstalacion')
		.factory('initInstalacion', initInstalacion);

	initInstalacion.$inject = ['$rootScope', '$log', '$q', 'leafletBoundsHelpers', 'config', 'dataService', 'instalacionesFactory', 'instalacionFactory', 'nivelesInstalacionFactory'];
	function initInstalacion($rootScope, $log, $q, leafletBoundsHelpers, config, dataService, instalaciones, instalacion, nivelesInstalacion) {

		var defaults ={
		  crs: L.CRS.EPSG3857,
		  maxZoom: 21,
		  minZoom: 0
		};

		var layers = {
		  principalLayer: {
			name: 'Google Streets',
			layerType: 'ROADMAP',
			type: 'google'
		  },
		  secondaryLayer: {
			name: 'Mapa Interior',
			type: 'imageOverlay',
			url: null,
			bounds: null
		  }
		};
		var centro = {
		  lat: 40.06641,
		  lng: -2.14533,
		  zoom: 17
		};

		var maxbounds = {};

		var controls = {
		  scale: {
			options: {
			  visible: true
			}

		  }
		};

		var factory = {
			init: init,
			initPlanta: initPlanta
		};

		return factory;

	// FUNCIONES

		function init (id) {
			var indice = null;
			if (!instalacion.instalacionCargada || id !== instalacion.idInstalacion) {
				instalacion.resetInstalacion(); 
				for (var i = 0; i < instalaciones.instalaciones.length; i++) {
					if (instalaciones.instalaciones[i].id === parseInt(id, 10)) {
						indice = i;
						instalacion.mapaInterior = !instalaciones.instalaciones[i].usar_google_maps;
						nivelesInstalacion.setPlantasInstalacion(instalaciones.instalaciones[i].mapas_instalacion);
						nivelesInstalacion.setPlantaActual(0);
						break;
					}
				}
			}
			if (indice || indice === 0) {
				return initMapa(indice);
			}
			else{
				return false;
			}
		}

		function initPlanta (id) {
			initMapa();
			instalacion.markers = {};
			instalacion.dibujarLocalizadores();
			instalacion.dibujarRouters();
			instalacion.dibujarAgentes();
			instalacion.dibujarActuadores();
			instalacion.dibujarLocalizadores();
			// $rootScope.$broadcast('plantaUpdate');
		}

		function initMapa (indice) {
			if (!config.getLoginStatus()) {
				return false;
			}
					
			if (instalacion.mapaInterior) {
				if (nivelesInstalacion.plantaActual) {
					layers.secondaryLayer.url = config.urlMedia + nivelesInstalacion.plantaActual.imagen_plano;
					layers.secondaryLayer.bounds = [[0, 0], 
												[nivelesInstalacion.plantaActual.alto_imagen_plano, nivelesInstalacion.plantaActual.ancho_imagen_plano]];
					maxbounds = leafletBoundsHelpers.createBoundsFromArray([[0, 0], [nivelesInstalacion.plantaActual.alto_imagen_plano, nivelesInstalacion.plantaActual.ancho_imagen_plano]]);
				}
				else{
					layers.secondaryLayer.url = config.urlToken + instalaciones.instalaciones[indice].url_mapa;
					layers.secondaryLayer.bounds = [[0, 0], [instalaciones.instalaciones[indice].alto_imagen_plano, instalaciones.instalaciones[indice].ancho_imagen_plano]];
					maxbounds = leafletBoundsHelpers.createBoundsFromArray([[0, 0], [instalaciones.instalaciones[indice].alto_imagen_plano, instalaciones.instalaciones[indice].ancho_imagen_plano]]);
				}
				defaults.crs = L.CRS.Simple;
				defaults.maxZoom = 2;
				defaults.minZoom = 0;
				centro.zoom = 0;
				centro.lat = maxbounds.southWest.lat/2;
				centro.lng = maxbounds.southWest.lng/2;

				instalacion.defaults = defaults;
				instalacion.layer = layers.secondaryLayer;
				instalacion.centro = centro;
				instalacion.centroInicial = angular.copy(instalacion.centro);
				instalacion.maxbounds = maxbounds;
				instalacion.controls = {};
			}
			else {
				centro.lat = instalaciones.instalaciones[indice].lat;
				centro.lng = instalaciones.instalaciones[indice].lng;
				centro.zoom = 17;

				instalacion.defaults = defaults;
				instalacion.layer = layers.principalLayer;
				instalacion.centro = angular.copy(centro);
				instalacion.centroInicial = angular.copy(centro);
				instalacion.controls = controls;
				instalacion.maxbounds = {};
			}
			return true;  
		}
	}

})();