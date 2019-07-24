(function () {

  'use strict';

  var app = angular.module('app.adminState');

  app.controller('adminDelCtrl', adminDelCtrl);

  adminDelCtrl.$inject = [
    '$state',
    // from state resolve
    'registeredEntities'
  ];

  function adminDelCtrl(
    $state,
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

    return vm;

  }

})();