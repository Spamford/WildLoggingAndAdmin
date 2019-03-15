(function(){
  'use strict';

  angular
    .module('app.adminState', [
      'ui.router',
      'ngAnimate',
      'app.auth'
     ])
    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('admin', {
          url: '/admin/',
          templateUrl: 'scripts/states/admin/templates/admin.html',
          controller: 'adminCtrl as vm',
          cache: false
        })
        .state('adminauth', {
          url: '/admin/auth',
          templateUrl: 'scripts/states/admin/templates/adminauth.html',
          controller: 'adminAuthCtrl as vm',
          cache: false
        })
        .state('adminevents', {
          url: '/admin/events/',
          templateUrl: 'scripts/states/admin/templates/admin-events.html',
          controller: 'adminEventsCtrl as vm',
          cache:false,
          resolve: {}
        })
      ;
    });
})();
