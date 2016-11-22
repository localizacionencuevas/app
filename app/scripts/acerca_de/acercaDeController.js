(function() {
  'use strict';

  angular
    .module('app.acercaDe')
    .controller('acercaDeController', acercaDe);

  acercaDe.$inject = ['$scope', '$log', '$state', '$window', 'dataService', 'config', 'instalacionesFactory'];

  function acercaDe ($scope, $log, $state, $window, dataService, config, instalaciones) {
    $log.log('Intro');
    $scope.$parent.$parent.navBarVisible = true;
    var vm = this;

// VIEW MODEL
    

    vm.functions = {
      
    };

// FUNCIONES
    
  }

})();