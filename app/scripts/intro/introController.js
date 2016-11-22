(function() {
  'use strict';

  angular
    .module('app.intro')
    .controller('introController', intro);

  intro.$inject = ['$scope', '$log', '$state', '$ionicSlideBoxDelegate'];

  function intro ($scope, $log, $state, $ionicSlideBoxDelegate) {
    $log.log('Intro');
    $scope.$parent.$parent.navBarVisible = true;
    $scope.$parent.$parent.ajustesVisible = false;
    // $scope.$parent.$parent.fichaVisible = false;

    var vm = this;

    vm.functions = {
      saltarIntro: saltarIntro
    }    

    // $scope.next = function() {
    //   $ionicSlideBoxDelegate.next();
    // };
    // $scope.previous = function() {
    //   $ionicSlideBoxDelegate.previous();
    // };

    // // Called each time the slide changes
    // $scope.slideChanged = function(index) {
    //   $scope.slideIndex = index;
    // };

    // activate();
    // //dataservice.logDispositivo().then(activate());

    // function activate() {
        
    // }

    function saltarIntro () {
      $state.go('app.login');
    }
  }

})();