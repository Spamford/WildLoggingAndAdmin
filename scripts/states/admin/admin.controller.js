(function () {
  'use strict';

  angular
    .module('app.adminState')
    .controller('adminCtrl', adminCtrl)
    .controller('adminAuthCtrl', adminAuthCtrl)
    .controller('adminEventsCtrl', adminEventsCtrl)
  ;

  //-----------------------

  adminCtrl.$inject = [
    '$scope',
    '$state',
    '$log',
    'authenticationService',
    'authenticationNotifyService'
  ];

  function adminCtrl(
    $scope,
    $state,
    $log,
    authenticationService,
    authenticationNotifyService
  ){
    var vm = angular.extend(this, {});
    vm.isAuthenticated = authenticationService.isAuthenticated();

    //--

    vm.login = function () {
      authenticationNotifyService.subscribe('auth0',callback);
      authenticationService.login();
    };

    function callback(){
      $log.log($scope.isAuthenticated);
      //$scope.$apply();
      $state.reload();
    }

    vm.logout = function(){
      authenticationService.logout();
      $state.reload();
    };

    vm.admin = function admin(itemType) {
      console.log("admin a ",itemType);
      $state.go('admin'+itemType.toLowerCase() );
    };
  }

  //-----------------------

  adminAuthCtrl.$inject = [
    '$scope',
    '$state',
    'authenticationService',
    'authenticationNotifyService'
  ];

  function adminAuthCtrl(
    $scope,
    $state,
    authenticationService,
    authenticationNotifyService
  ){
    var vm = angular.extend(this, {});

    vm.isAuthenticated = authenticationService.isAuthenticated();
  }

  //-----------------------

  adminEventsCtrl.$inject = [
    '$scope',
    '$state',
    'authenticationService',
    'authenticationNotifyService',
    'sightingsSrvc',
    'speciesSrvc'
  ];

  function adminEventsCtrl(
    $scope,
    $state,
    authenticationService,
    authenticationNotifyService,
    sightingsSrvc,
    speciesSrvc
  ){
    var vm = angular.extend(this, {});

    vm.isAuthenticated = authenticationService.isAuthenticated();

    vm.events = [ ];

    vm.busy = false;

    vm.login = function () {
      authenticationNotifyService.subscribe('auth0',callback);
      authenticationService.login();
    };

    function callback(){
      $log.log($scope.isAuthenticated);
      //$scope.$apply();
      $state.reload();
    }

    vm.logout = function(){
      authenticationService.logout();
      $state.reload();
    };

    vm.updateSightings = function updateSightings(postcode, datafrom, dateto, thingsName) {
      vm.busy = true;
      sightingsSrvc.getSightings().then(
        function updateSightingsSuccess(data) {
          angular.extend(vm.events, data.data);
          // now remove items in vm.events that were not in vm.data
          for (var i=0; i<vm.events.length; i++) {
            // is event[i].id in data.data[] ? if not remove it
            var foundIt = false;
            for (var j=0; j<data.data.length; j++) {
              if( data.data[j].id===vm.events[i].id ) {
                foundIt = true;
              }
            }
            if(foundIt===false) {
              removeFromEvents(vm.events[i].id);
            }
          }

          // add human-readable dates and names to items without one
          angular.forEach(vm.events,function(v,k){
            vm.events.index=k;
            if(vm.events[k].hasOwnProperty("humanDate")===false) {
              vm.events[k].humanDate = [
                new Date(vm.events[k].date).toLocaleDateString(),
                new Date(vm.events[k].date).toLocaleTimeString()
              ].join(" ");
            }
            if(vm.events[k].hasOwnProperty("label")===false) {
              speciesSrvc.getSpeciesFromId( vm.events[k].thing ).then (
                function getSpeciesFromIdSuccess(data) {
                  vm.events[k].label = data.data.name;
                },
                function getSpeciesFromIdError(error) {
                  console.log("got species: error ",error);
                  vm.events[k].label = "(a sighting)";
                }
              );
            }
          });
          vm.busy = false;
        },
        function updateSightingsError(error) {
          console.log("updateSightingsError: ", error);
          vm.busy = false;
        }
      );
    };

    vm.deleteItem = function deleteItem(payload) {
      console.log("adminEventsCtrl:deleteItem ",payload.ref);
      vm.busy = true;
      sightingsSrvc.deleteSighting(payload.ref).then(
        function deleteItemSuccess(data) {
          vm.busy = false;
          removeFromEvents(payload.ref);
        },
        function deleteItemError(error) {
          vm.busy=false;
          console.log("OOPS!",error);
          alert("Problem removing item: "+String(error) );
        }
      );
    };

    function removeFromEvents(ref) {
      for (var i=0; i<vm.events.length; i++) {
        if(vm.events[i].id===ref) {
          vm.events.splice(i,1);
        }
      }
    }

    vm.updateSightings();

  }

})();
