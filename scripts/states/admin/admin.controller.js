(function () {

  'use strict';

  var app = angular.module('app.adminState');
    
  app.controller('adminCtrl', adminCtrl);

  adminCtrl.$inject = [
    '$state'
  ];

  function adminCtrl(
    $state
  ) {
    
    var vm = angular.extend(this, {

    });

    vm.goAdminSpecies = function () {
      $state.go('admin-delete', { entity: 'species' });
    }
    
    vm.goAdminSightings = function () {
      $state.go('admin-delete', { entity: 'sightings' });
    }

    return vm;
  }

})();