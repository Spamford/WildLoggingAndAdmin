(function () {

    'use strict';

    var app = angular.module('app.adminState');

    app.directive('searchBar', function () {
        return {
            restrict: "E",
            scope: {
                searchFunc: "=searchFunc",
                placeholderText: "@placeholderText"
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

        vm.handleEvent = function handleEvent(evt) {
            let key = 'which' in evt ? evt.which : evt.keyCode;
            if (key === 13) {
                vm.searchFunc(vm.searchStr);
            }
        }

        return vm;
    }

})();