(function () {

    'use strict';

    var app = angular.module('app.adminState');

    app.directive('searchBar', function () {
        return {
            restrict: "E",
            scope: {
                searchFunc: "=searchFunc",
                placeholderText: "@placeholderText",
                showSpinner: "=showSpinner"
            },
            templateUrl: "scripts/states/admin/admin_search/admin.search.template.html",
            controller: searchCtrl,
            controllerAs: "vm",
            bindToController: true
        }
    });

    app.controller('searchCtrl', searchCtrl);

    searchCtrl.$inject = [];

    function searchCtrl() {
        var vm = angular.extend(this, {});
        return vm;
    }

})();