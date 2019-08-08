(function () {

    'use strict';

    var app = angular.module('app.adminState', []);

    app.config(function ($stateProvider) {

        $stateProvider.state('admin', {
            url: '/admin',
            templateUrl: 'scripts/states/admin/admin.html',
            controller: 'adminCtrl as vm',
            cache: false
        });

        $stateProvider.state('admin-delete', {
            url: '/admin/:entity',
            templateUrl: './scripts/states/admin/admin_delete/admin.delete.html',
            controller: 'adminDelCtrl as vm',
            cache: false
        });

    });

})();