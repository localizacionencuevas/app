(function() {
	'use strict';

	angular
		.module('app.fichaInstalacion')
		.config(appConfig);

	/* @ngInject */
	function appConfig($stateProvider) {
		$stateProvider

				.state('app.fichaInstalacion', {
					abstract: true,
					url: "/fichaInstalacion/:id",
						views: {
							'contenido': {
								templateUrl: "scripts/fichaInstalacion/mapaInstalacion.html",
								controller: 'mapaInstalacionCtrl as vm'
							}
						}
				})
					.state('app.fichaInstalacion.index', {
						url: "",
						views: {
							'contenido2': {
								templateUrl: "scripts/fichaInstalacion/fichaInstalacion.html",
								controller: 'fichaInstalacionController as vm'
							}
						}
					});
				
		}

})();