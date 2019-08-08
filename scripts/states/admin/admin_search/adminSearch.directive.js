(function () {

    'use strict';

    var app = angular.module('app.adminState');

    app.directive('searchBar', function () {
        return {
            restrict: "E",
            scope: {
                searchFunc: "=searchFunc",
                placeholderText: "@placeholderText",
                searching: "="
            },
            templateUrl: "scripts/states/admin/admin_search/admin.search.template.html",
            controller: searchBarCtrl,
            controllerAs: "vm",
            bindToController: true
        }
    });

    app.controller('searchBarCtrl', searchBarCtrl);

    searchBarCtrl.$inject = [];

    function searchBarCtrl() {
        var vm = angular.extend(this, {});

        vm.handleEvent = function handleEvent(evt) {
            let key = 'which' in evt ? evt.which : evt.keyCode;
            if (key === 13) {
                vm.searchFunc(vm.searchStr);
            }
        }

        return vm;
    }

})();