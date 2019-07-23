(function() {
    'use strict';
    angular
    .module('app.loginState', [
        
    ]).config(function($stateProvider) {
    $stateProvider
    .state('login', {
            url: '/login',
            templateUrl: 'scripts/states/login/login.html',
            controller: 'loginCtrl as vm',
            cache: false
        })
    });
})();