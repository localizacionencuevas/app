(function() {
	'use strict';

	angular
	  .module('app.fichaInstalacion')
	  .factory('nivelesInstalacionFactory', nivelesInstalacion);

	nivelesInstalacion.$inject = ['$log', '$filter'];
	function nivelesInstalacion($log, $filter) {

		var plantasDeLaInstalacion = [];

		var factory = {
			plantaActual: {},
			numeroDePlantas: null,
			// funciones
			setPlantasInstalacion: setPlantasInstalacion,
			getPlantasInstalacion: getPlantasInstalacion,
			setPlantaActual: setPlantaActual,
			getPlantaPorNivel: getPlantaPorNivel,
			getPlantaPorId: getPlantaPorId,
			resetPlantasInstalacion: resetPlantasInstalacion
		};

		return factory;

	// FUNCIONES
		function setPlantasInstalacion (plantas) {
			resetPlantasInstalacion();
			plantasDeLaInstalacion = $filter('orderBy')(plantas, 'planta', true);;
			factory.numeroDePlantas = plantas.length;
		}

		function getPlantasInstalacion () {
			return plantasDeLaInstalacion;
		}

		function setPlantaActual (planta) {
			for (var k = 0; k < plantasDeLaInstalacion.length; k++) {
				if (plantasDeLaInstalacion[k].planta === planta) {
					factory.plantaActual = plantasDeLaInstalacion[k];
					break;
				}
			}
		}

		function getPlantaPorNivel (planta) {
			var plantaABuscar = {};
			for (var i = 0; i < plantasDeLaInstalacion.length; i++) {
				if (plantasDeLaInstalacion[i].planta === planta) {
					plantaABuscar = plantasDeLaInstalacion[i];
					break;
				}
			}
			return plantaABuscar;
		}

		function getPlantaPorId (id) {
			var plantaABuscar = {};
			for (var j = 0; j < plantasDeLaInstalacion.length; j++) {
				if (plantasDeLaInstalacion[j].id === id) {
					plantaABuscar = plantasDeLaInstalacion[j];
					break;
				}
			}
			return plantaABuscar;
		}

		function resetPlantasInstalacion () {
			factory.plantaActual = {};
			factory.numeroDePlantas = null;
		}

	}
})();