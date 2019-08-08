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

        let vm = angular.extend(this, {
            title: capitalize($state.params.entity),

            // Search bar properties
            searchStr: "",
            lastSearch: "",
            placeholderProperty: $state.params.entity === 'species' ? 'name' : 'postcode',

            // Pagination request properties
            pageSize: 3,
            nextPage: 1,

            // Array declarations
            entities: [],
            selectedEntities: [],
            fetchedSpeciesIDs: [],

            // Used to try interpolating the correct properties from the requested entites
            showName: $state.params.entity === 'species',
            showPostcode: $state.params.entity === 'sightings',

            // Used to control behaviour of UI
            allSelected: false,
            noMoreEntitiesToGet: true,
            searching: false
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
            document.getElementById('admin-check-all').checked = vm.selectedEntities.length === vm.entities.length;

        }

        vm.selectAll = function selectAll() {
            // Using angular.copy as it creates a new object and assigns that to vm.selectedEntities whereas
            vm.allSelected ? angular.copy(vm.entities, vm.selectedEntities) : angular.copy([], vm.selectedEntities);
        }


        vm.deleteSelectedEntities = function deleteSelectedEntities() {
            vm.searching = true; // Show spinner
            deleteEntities().then(
                function success() {
                    vm.searching = false;
                    // Remove selected entities from list
                    angular.copy(vm.entities.diff(vm.selectedEntities), vm.entities);
                    // Clear selected entities
                    angular.copy([], vm.selectedEntities);
                },
                function failure(error) {
                    vm.searching = false;
                    console.log(error);
                }
            );
        }

        vm.searchForEntities = function searchForEntities(searchStr = "") { // searchStr defaults to "" to avoid undefined.
            let lowercaseSearchStr = searchStr.toLowerCase();

            // Returning as the "more" button is supposed to be used to get more pages of the same search.
            if (vm.lastSearch === lowercaseSearchStr || lowercaseSearchStr === "") {
                return;
            } else {
                // Searching for something different so emptying relevant arrays and setting relevant variables.
                vm.noMoreEntitiesToGet = false;
                vm.nextPage = 1;
                vm.fetchedSpeciesIDs = [];
                vm.selectedEntities = [];
            }

            getEntities(lowercaseSearchStr, true)
        }

        vm.getMoreEntities = function getMoreEntities() {
            getEntities(vm.lastSearch, false)
        }

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
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

        /**
         * Iterates over each element of the array that the method was called on, checks to see if that element is in the array that
         * was passed in as an argument and keeps the elements that were not in the array that was passed thereby filtering out those elements.
         * See https://stackoverflow.com/a/4026828 for more information
         * @param {Array} arr Array containing elements to filter out. 
         */
        Array.prototype.diff = function diff(arr) {
            // Here, this refers to the array that diff was called on.
            return this.filter(hostArrElem => arr.indexOf(hostArrElem) < 0)
        }

        function getEntities(searchStr, saveSearch = false) {
            function successCallback(response) {
                // Need to replace vm.entities when saving search as it is a search for a different entity altogether.
                // Otherwise the search results would get appended to the results from the previous search.
                saveSearch ? vm.entities = response.data : vm.entities.push(...response.data);
                if (vm.showPostcode) displayMoreInfo();
                vm.lastSearch = saveSearch ? searchStr : vm.lastSearch;
                vm.noMoreEntitiesToGet = response.data.length === 0;
                vm.nextPage++;
                vm.searching = false;
            }

            function failureCallback(error) {
                console.log("Failed to get entities.", error);
                vm.searching = false;
            }

            if (vm.showName) {
                speciesSrvc.getSpeciesByName(searchStr, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
                vm.searching = true;
            } else if (vm.showPostcode) {
                sightingsSrvc.getSightingsByName(searchStr, vm.pageSize, vm.nextPage).then(successCallback, failureCallback);
                vm.searching = true;
            }
        }

        function displayMoreInfo() {

            if (vm.showName) return; // Only do this for admin delete sightings page

            // https://gist.github.com/telekosmos/3b62a31a5c43f40849bb#gistcomment-1830283
            // Filter out duplicates and create array of the new species IDs from requesting another page.
            let newSpeciesIDs = [...new Set(vm.entities.map(entity => entity.thing))];

            // Find duplicates
            let alreadyFetchedSpecies = vm.entities.map(entity => {
                if (!entity.hasOwnProperty("speciesName")) {
                    for (let i = 0; i < vm.entities.length; i++) {
                        if (vm.entities[i].hasOwnProperty("speciesName") && entity.thing === vm.entities[i].thing) {
                            return {
                                id: vm.entities[i].thing,
                                name: vm.entities[i].speciesName
                            }
                        }
                    }
                }
            });

            // Filter out non duplicates
            alreadyFetchedSpecies = alreadyFetchedSpecies.filter((x) => x !== undefined);

            function successCallback(response) {
                assignFetchedSpeciesNames(response);
                assignDuplicateSpeciesNames(alreadyFetchedSpecies);
                vm.fetchedSpeciesIDs = newSpeciesIDs;
            }

            function failureCallback(error) {
                console.error(error);
            }

            if (newSpeciesIDs.length > vm.fetchedSpeciesIDs.length) {
                // Among the sightings fetched from the server, at least one of them is of a species that hasn't been requested from the server yet.
                getNewSpecies(newSpeciesIDs.diff(vm.fetchedSpeciesIDs)).then(successCallback, failureCallback);
            } else {
                // The new sightings fetched from the server have a thing (species ID) property that has already been fetched which makes them duplicates.
                assignDuplicateSpeciesNames(alreadyFetchedSpecies)
            }

        }

        /**
         * Assigns the names of the new species for each sighting that was recieved from the next page request.
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

        /**
         * Assigns the names of species that were already requested previously in earlier page requests. This helps avoid unnecessary network requests.
         * @param {Array} alreadyFetchedSpecies The species that were already fetched for previous page request results
         */
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

        function getNewSpecies(newSpeciesIDArr) {
            let promiseObj = $q.defer();
            let promiseArray = newSpeciesIDArr.map(speciesID => speciesSrvc.getSpeciesFromId(speciesID));
            promiseObj.resolve($q.all(promiseArray));
            promiseObj.reject(new Error("Failed to GET associated unique species for sightings"));
            return promiseObj.promise;
        }

        return vm;

    }

})();