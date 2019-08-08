(function () {

    'use strict';

    var app = angular.module('app.loginState', []);

    app.config(function ($stateProvider) {
        $stateProvider.state('login', {
            url: '/login',
            templateUrl: 'scripts/states/login/login.html',
            controller: 'loginCtrl as vm',
            cache: false
        });
    });

})();