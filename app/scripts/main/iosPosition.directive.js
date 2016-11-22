(function () {
  'use strict';

  angular
    .module('app.main')
    .directive('iosPosition', iosPosition);

    iosPosition.$inject = ['$ionicPlatform'];

	function iosPosition ($ionicPlatform) {
		return {
			restrict: 'A',
			link: function(scope, elem, attrs) {

	            if (ionic.Platform.isIOS()) {
	            	if (elem.hasClass('menuCueva')) {
						elem.css('top','63px');
	            	}
	            	else{
	            		elem.css('position','absolute');
	                	elem.css('top','-20px');
	            	}

	            }

			}
		};

	}
})();