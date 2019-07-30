(function () {

  'use strict';

  var app = angular.module('app.adminState');

  app.controller('adminDelCtrl', adminDelCtrl);

  adminDelCtrl.$inject = [
    '$state',
    '$q',
    'speciesSrvc',
    'sightingsSrvc'
  ];

  function adminDelCtrl(
    $state,
    $q,
    speciesSrvc,
    sightingsSrvc
  ) {

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    var vm = angular.extend(this, {
      title: capitalize($state.params.entity),
      placeholderProperty: $state.params.entity === 'species' ? 'name' : 'postcode',
      searchStr: "",
      lastSearch: "",
      pageSize: 1,
      nextPage: 1,
      entities: [],
      selectedEntities: [],
      showName: $state.params.entity === 'species',
      showPostcode: $state.params.entity === 'sightings',
      allSelected: false,
      noMoreEntitiesToGet: true,
      showSpinner: false
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
      vm.showSpinner = true;
      deleteEntities().then(
        function success(response) {
          vm.showSpinner = false;
          console.log("DELETE Successful : ", response);
        },
        function failure(error) {
          vm.showSpinner = false;
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
          promiseArray.push(sightingsSrvc.deleteSightings(vm.selectedEntities[i].id));
        }
      }

      promiseObj.resolve($q.all(promiseArray));
      promiseObj.reject(new Error("DELETE Failed"));

      return promiseObj.promise;
    }

    vm.getEntities = function getEntities(searchStr) {

      let entityFilter = searchStr.toLowerCase();

      if (vm.lastSearch === entityFilter || entityFilter === "") {
        vm.noMoreEntitiesToGet = false;
        return;
      } else {
        vm.nextPage = 1;
      }

      function successCallback(response) {
        vm.lastSearch = entityFilter;
        vm.noMoreEntitiesToGet = false;
        vm.entities = response.data;
        vm.nextPage++;
        vm.showSpinner = false;
      }

      function failureCallback(error) {
        console.log("Failed to get entities.", error);
        vm.showSpinner = false;
      }

      if (vm.showName) {
        vm.showSpinner = true;
        speciesSrvc.getSpeciesByName(entityFilter, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
      } else if (vm.showPostcode) {
        vm.showSpinner = true;
        sightingsSrvc.getSightingsByName(entityFilter, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
      }

    }

    vm.getMoreEntities = function getMoreEntities() {

      function successCallback(response) {
        vm.entities.push(...response.data);
        vm.nextPage++;
        vm.noMoreEntitiesToGet = response.data.length === 0;
        vm.showSpinner = false;
      }

      function failureCallback(error) {
        console.log("Failed to get MORE entities...", error);
        vm.showSpinner = false;
      }

      if (vm.showName) {
        speciesSrvc.getSpeciesByName(vm.lastSearch, vm.pageSize, vm.nextPage).then(successCallback, failureCallback)
        vm.showSpinner = true;
      } else if (vm.showPostcode) {
        sightingsSrvc.getSightingsByName(vm.lastSearch, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
        vm.showSpinner = true;
      }

    }

    return vm;

  }

})();