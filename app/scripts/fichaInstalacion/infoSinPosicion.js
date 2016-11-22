(function () {
  'use strict';

  angular
    .module('app.fichaInstalacion')
    .directive('infoSinPosicion', infoSinPosicion);

    infoSinPosicion.$inject = ['leafletData', '$window'];

	function infoSinPosicion (leafletData, $window) {
		return {
			restrict: 'AE',
			replace: true,
			templateUrl: 'scripts/fichaInstalacion/infoSinPosicion.html',
			// link: function(scope, elem, attrs) {

			// 	scope.$watch('vm.infoVisible', function (value, old) {
			// 		if (value !== old && value) {
			// 			//colocamos el popup sobre el elemento
			// 			// posicionarInfo();
			// 		}
			// 	});

			// 	// scope.$on('leafletDirectiveMap.zoomend', function (e, args) {
			// 	// 	posicionarInfo();
			// 	// });

			// 	// scope.$on('leafletDirectiveMap.drag', function (e, args) {
			// 	// 	posicionarInfo();
			// 	// });

			// 	function posicionarInfo () {
			// 		// elem.css("display", "block");
			// 		// leafletData.getMap().then(function (map) {
			// 		// 	if (scope.contenidoPopUp.coord) {
			// 		// 		var _coord = map.latLngToContainerPoint(scope.contenidoPopUp.coord);
			// 		// 		var _x = _coord.x-143;
			// 		// 		var _y = _coord.y-282;

			// 		// 		elem.css("top", _y+"px");
			// 		// 		elem.css("left", _x+"px");
			// 		// 	}
			// 		// });

			// 	}
			// }
		};

	}
})();