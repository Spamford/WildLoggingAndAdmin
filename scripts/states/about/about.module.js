(function () {

  'use strict';

  var app = angular.module('app.aboutState', []);

  app.config(function ($stateProvider) {
    $stateProvider
      .state('about', {
        url: '/about',
        templateUrl: 'scripts/states/about/about.html',
        controller: 'aboutCtrl as vm',
        cache: false
      })
  });

})();