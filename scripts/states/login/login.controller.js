(function () {

    'use strict';

    var app = angular.module('app.loginState');

    app.controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = [
        'authService'
    ];

    function loginCtrl(
        authService
    ) {

        var vm = angular.extend(this, {});

        vm.auth = authService;

        return vm;

    }

})();