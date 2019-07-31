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
      pageSize: 3,
      nextPage: 1,
      entities: [],
      selectedEntities: [],
      showName: $state.params.entity === 'species',
      showPostcode: $state.params.entity === 'sightings',
      allSelected: false,
      noMoreEntitiesToGet: true,
      searching: false,
      fetchedUniqueSpeciesIDs: []
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
      vm.searching = true;
      deleteEntities().then(
        function success(response) {
          vm.searching = false;
          console.log("DELETE Successful : ", response);
        },
        function failure(error) {
          vm.searching = false;
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

    vm.getEntities = function getEntities(searchStr = "") {

      let entityFilter = searchStr.toLowerCase();

      if (vm.lastSearch === entityFilter || entityFilter === "") {
        vm.noMoreEntitiesToGet = false;
        return;
      } else {
        vm.nextPage = 1;
        vm.fetchedUniqueSpeciesIDs = [];
      }

      function successCallback(response) {
        vm.entities = response.data;
        if (vm.showPostcode) displayMoreInfo();
        vm.lastSearch = entityFilter;
        vm.noMoreEntitiesToGet = false;
        vm.nextPage++;
        vm.searching = false;
      }

      function failureCallback(error) {
        console.log("Failed to get entities.", error);
        vm.searching = false;
      }

      if (vm.showName) {
        vm.searching = true;
        speciesSrvc.getSpeciesByName(entityFilter, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
      } else if (vm.showPostcode) {
        vm.searching = true;
        sightingsSrvc.getSightingsByName(entityFilter, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
      }

    }

    vm.getMoreEntities = function getMoreEntities() {

      function successCallback(response) {
        vm.entities.push(...response.data);
        if (vm.showPostcode) displayMoreInfo();
        vm.nextPage++;
        vm.noMoreEntitiesToGet = response.data.length === 0;
        vm.searching = false;
      }

      function failureCallback(error) {
        console.log("Failed to get MORE entities...", error);
        vm.searching = false;
      }

      if (vm.showName) {
        speciesSrvc.getSpeciesByName(vm.lastSearch, vm.pageSize, vm.nextPage).then(successCallback, failureCallback)
        vm.searching = true;
      } else if (vm.showPostcode) {
        sightingsSrvc.getSightingsByName(vm.lastSearch, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
        vm.searching = true;
      }

    }

    function displayMoreInfo() {

      let uniqueSpeciesIDs = [...new Set(vm.entities.map(x => x.thing))];

      let alreadyFetchedSpecies = vm.entities.map((x) => {
        if (!x.hasOwnProperty("speciesName")) {
          for (let i = 0; i < vm.entities.length; i++) {
            if (vm.entities[i].hasOwnProperty("speciesName") && x.thing === vm.entities[i].thing) {
              return {
                id: vm.entities[i].thing,
                name: vm.entities[i].speciesName
              }
            }
          }
        }
      });

      alreadyFetchedSpecies = alreadyFetchedSpecies.filter((x) => x !== undefined);

      function successCallback(response) {
        assignFetchedSpeciesNames(response);
        assignDuplicateSpeciesNames(alreadyFetchedSpecies);
        vm.fetchedUniqueSpeciesIDs = uniqueSpeciesIDs;
      }

      function failureCallback(error) {
        console.error(error);
      }

      if (uniqueSpeciesIDs.length > vm.fetchedUniqueSpeciesIDs.length) {
        // Among the sightings fetched from the server, at least one of them is of a species that hasn't been requested from the server yet.
        getUniqueSpecies(uniqueSpeciesIDs.diff(vm.fetchedUniqueSpeciesIDs)).then(successCallback, failureCallback);
      } else {
        // How are the names shown when the new species fetched from the server have a thing property that has already been fetched.
        assignDuplicateSpeciesNames(alreadyFetchedSpecies)
      }

    }

    function assignDuplicateSpeciesNames(alreadyFetchedSpecies) {
      for (let i = 0; i < vm.entities.length; i++) {
        if (!vm.entities[i].hasOwnProperty("speciesName")) {
          for (let j = 0; j < alreadyFetchedSpecies.length; j++) {
            if (vm.entities[i].thing === alreadyFetchedSpecies[j].id) {
              vm.entities[i].speciesName = alreadyFetchedSpecies[j].name;
            }
          }
        }
      }
    }

    /**
     * Assigns the names of the species for each sighting
     * @param {Object} res Response from the server
     */
    function assignFetchedSpeciesNames(res) {
      for (let i = 0; i < vm.entities.length; i++) {
        for (let dataObj in res) {
          if (res.hasOwnProperty(dataObj)) {
            if (vm.entities[i].thing === res[dataObj].data.id) {
              vm.entities[i].speciesName = res[dataObj].data.name;
            }
          }
        }
      }
    }

    // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
    Array.prototype.diff = function (a) {
      return this.filter(i => a.indexOf(i) < 0)
    }

    function getUniqueSpecies(uniqueSpeciesIDArr) {
      let promiseObj = $q.defer();
      let promiseArray = uniqueSpeciesIDArr.map(speciesID => speciesSrvc.getSpeciesFromId(speciesID));
      promiseObj.resolve($q.all(promiseArray));
      promiseObj.reject(new Error("Failed to GET associated unique species for sightings"));
      return promiseObj.promise;
    }

    return vm;

  }

})();