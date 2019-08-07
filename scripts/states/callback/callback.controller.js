(function () {

  'use strict';

  let app = angular.module('app.callbackState');

  app.config(function (
    $stateProvider
  ) {
    $stateProvider.state('callback', {
      url: '/callback',
      templateUrl: 'scripts/states/callback/callback.html',
      controller: 'callbackCtrl as vm',
      cache: false
    });
  })
  
  app.controller('callbackCtrl', callbackCtrl);

  callbackCtrl.$inject = [
    $state
  ];

  function callbackCtrl() {
    $state.go("admin");
  }

})();