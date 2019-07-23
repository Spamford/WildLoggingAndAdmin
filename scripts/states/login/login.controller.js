(function () {
    'use strict';

    angular
        .module('app.loginState')
        .controller('loginCtrl', loginCtrl);

        loginCtrl.$inject = [
            '$scope',
            '$timeout',
            '$state'
        ];

    function loginCtrl(
      $scope,
      $timeout,
      $state  
    ) {
        var vm = angular.extend(this, {});
        //Controller
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