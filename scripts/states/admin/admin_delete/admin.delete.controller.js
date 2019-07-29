(function () {

  'use strict';

  var app = angular.module('app.adminState');

  app.controller('adminDelCtrl', adminDelCtrl);

  adminDelCtrl.$inject = [
    '$state',
    '$q',
    'speciesSrvc',
    'sightingsSrvc',
    // from state resolve
    // 'registeredEntities'
  ];

  function adminDelCtrl(
    $state,
    $q,
    speciesSrvc,
    sightingsSrvc,
    // registeredEntities
  ) {

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    var vm = angular.extend(this, {
      title: capitalize($state.params.entity),
      placeholderProperty: $state.params.entity === 'species' ? 'name' : 'postcode',
      searchStr: "",
      paginationSize: 10,
      entities: [],
      selectedEntities: [],
      // exceedsPaginationSize: vm.entities.length > vm.paginationSize,
      showName: $state.params.entity === 'species',
      showPostcode: $state.params.entity === 'sightings',
      allSelected: false
    });

    vm.toggleSelection = function toggleSelection(entity) {

      let index = vm.selectedEntities.indexOf(entity);
      if (index > -1) {
        // Entity was already selected. Remove it from the array.
        vm.selectedEntities.splice(index, 1);
      } else {
        // Not in the array of selected entities. Add it to the array.
        vm.selectedEntities.push(entity);
      }

      // Update the select all checkbox
      let checkall = document.getElementById('admin-check-all');
      checkall.checked = vm.selectedEntities.length === vm.entities.length;
      checkall.indeterminate = vm.selectedEntities.length > 0 && vm.selectedEntities.length < vm.entities.length;

    }

    vm.selectAll = function selectAll() {
      // Using angular.copy as it creates a new object and assigns that to vm.selectedEntities whereas
      vm.allSelected ? angular.copy(vm.entities, vm.selectedEntities) : angular.copy([], vm.selectedEntities);
    }


    vm.deleteSelectedEntities = function deleteSelectedEntities() {
      deleteEntities().then(
        function success(response) {
          console.log("DELETE Successful : ", response);
        },
        function failure(error) {
          console.log("Oh no something went wrong... :) -> ", error);
        }
      );
    }

    function deleteEntities() {

      let promiseObj = $q.defer();
      let promiseArray = [];

      if (vm.showName) { // if on the delete species page
        for (let i = 0; i < vm.selectedEntities.length; i++) {
          promiseArray.push(speciesSrvc.deleteSpecies(vm.selectedEntities[i].id));
        }
      } else if (vm.showPostcode) { // if on the delete sightings page
        for (let i = 0; i < vm.selectedEntities.length; i++) {
          console.log(vm.selectedEntities[i].id);
          promiseArray.push(sightingsSrvc.deleteSightings(vm.selectedEntities[i].id));
        }
      }

      promiseObj.resolve($q.all(promiseArray));
      promiseObj.reject(new Error("DELETE Failed"));

      return promiseObj.promise;
    }

    vm.getEntities = function getEntities(queryParam) {
      if (vm.showName) {
        speciesSrvc.getSpeciesByName(queryParam).then(
          function success(response) {
            vm.entities = response.data;
          },
          function failure(error) {
            console.log("Failed to get entities.", error);
          }
        );
      } else if (vm.showPostcode) {
        // TODO: Same as above but need to implement method in service.
      }
    }

    vm.getMoreEntities = function getMoreEntities() {
        console.log("Getting more entities");
    }

    return vm;

  }

})();