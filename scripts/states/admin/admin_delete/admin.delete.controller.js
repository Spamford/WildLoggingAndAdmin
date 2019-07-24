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
    'registeredEntities'
  ];

  function adminDelCtrl(
    $state,
    $q,
    speciesSrvc,
    sightingsSrvc,
    registeredEntities
  ) {

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    var vm = angular.extend(this, {
      title: capitalize($state.params.entity),
      searchStr: "",
      entities: registeredEntities,
      selectedEntities: [],
      showName: $state.params.entity === 'species',
      showPostcode: $state.params.entity === 'sightings'
    });

    console.log(vm.entities);

    vm.toggleSelection = function toggleSelection(entity) {
      var index = vm.selectedEntities.indexOf(entity);

      if (index > -1) {
        // Entity was already selected. Remove it from the array.
        vm.selectedEntities.splice(index, 1);
        console.debug(`${vm.selectedEntities.length} entities currently selected.`);
      }

      // Not in the array of selected entities. Add it to the array.
      else {
        vm.selectedEntities.push(entity);
        console.debug(`${vm.selectedEntities.length} entities currently selected.`);
        var checkboxes = document.querySelectorAll('input.admin-check'),
          checkall = document.getElementById('admin-check-all');
        checkboxes.indeterminate = true;
        for (var i = 0; i < checkboxes.length; i++) {
          checkboxes[i].onclick = function () {
            var checkedCount = document.querySelectorAll('input.admin-check:checked').length;

            checkall.checked = checkedCount > 0;
            checkall.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
          }
        }

        checkall.onclick = function () {
          for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = this.checked;
          }
        }
      }
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

    return vm;

  }

})();