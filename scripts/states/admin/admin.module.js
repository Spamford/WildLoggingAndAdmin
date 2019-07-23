(function () {

    'use strict';

    var app = angular.module('app.adminState', [

    ]);

    app.config(function ($stateProvider, $urlRouterProvider) {

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
            cache: false,
            resolve: {
                registeredEntities: function($q, $stateParams, speciesSrvc, sightingsSrvc) {

                    let entity = $stateParams.entity;
                    console.log(entity);
                    var promiseObj = $q.defer();

                    if (entity === "species") {

                        speciesSrvc.getAllRegisteredSpecies().then(
                            function success(response) {
                                promiseObj.resolve(response.data);
                            },
                            function failure(err) {
                                promiseObj.reject(err);
                            }
                        );

                    }
                    
                    if (entity === "sightings") {

                        sightingsSrvc.getAllRegisteredSightings().then(
                            function success(response) {
                                promiseObj.resolve(response.data);
                            },
                            function failure(err) {
                                promiseObj.reject(err);
                            }
                        );

                    }

                    return promiseObj.promise;
                }
            }
        });

        $urlRouterProvider.otherwise('home');

    });

})();