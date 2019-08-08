(function () {

    'use strict';

    var app = angular.module('app.loginState');

    app.controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = [
        '$state'
    ];

    function loginCtrl(
        $state
    ) {

        var vm = angular.extend(this, {});

        vm.goToAdmin = function goToAdmin() {
            $state.go('admin');
        }

        return vm;

    }

})();