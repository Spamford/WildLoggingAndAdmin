(function () {
  'use strict';

  angular
		.module('app.aboutState')
		.controller('aboutCtrl', aboutCtrl);

  aboutCtrl.$inject = [
	  '$scope',
	  '$timeout',
	  '$state'
  ];

  function aboutCtrl(
    $scope,
    $timeout,
    $state
  ) {
    var vm = angular.extend(this, {});
    //Controller below
    vm.goHome = function goHome(){
	    console.log("go home!");
      $state.go('home');
    }

    vm.goSearch = function() {
      console.log("go search!");
      $state.go('search');
    };

    vm.goAbout = function() {
      console.log("go about!");
      $state.go('about');
    };

    vm.goLogin = function(){
      console.log("go login!");
      $state.go('login');
    };
   
		return vm;
  }
		
})();
