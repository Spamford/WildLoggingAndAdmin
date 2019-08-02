(function () {

    'use strict';

    var app = angular.module('app.adminState');

    app.controller('adminCtrl', adminCtrl);

    adminCtrl.$inject = [
        '$state',
        'authService'
    ];

    function adminCtrl(
        $state,
        authService
    ) {

        if (!authService.isAuthenticated()) return;

        var vm = angular.extend(this, {});

        vm.goAdminSpecies = function () {
            $state.go('admin-delete', { entity: 'species' });
        }

        vm.goAdminSightings = function () {
            $state.go('admin-delete', { entity: 'sightings' });
        }

        return vm;

    }

})();