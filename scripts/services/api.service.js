// api interface module
// see https://trello.com/c/KOPeRLUa/67-api-module
//
(function() {
  'use strict';

  angular
    .module('app.api', [])
    .factory('speciesSrvc', speciesSrvc)
    .factory('sightingsSrvc', sightingsSrvc)
  ;

  //
  //
  // speciesSrvc
  //
  //

  speciesSrvc.$inject = [
    '$q',
    '$timeout',
    '$sce',
    '$http'
  ];
  function speciesSrvc(
    $q,
    $timeout,
    $sce,
    $http
  ) {
    var service = {};

    service.baseApiURL = "https://urbanwilddbapi.herokuapp.com/";

    // methods as per https://trello.com/c/3sLYXMgq/64-species-service

    service.getSuggestedSpeciesNames = function getSuggestedSpeciesNames( searchTerms ) {
      var defer = $q.defer();
      var requestUrl = "";
      var cleanedSearchTerms = searchTerms.replace(/[^a-zA-Z0-9 :]/g, ''); // regex out all non alphanumeric characters

      if( cleanedSearchTerms.length>0 ) {
        requestUrl = "https://www.itis.gov/ITISWebService/jsonservice/searchForAnyMatch?jsonP=JSON_CALLBACK&srchKey=" + cleanedSearchTerms;
      }
      if( requestUrl !== "" ) {
        return $http.jsonp( requestUrl , { jsonpCallbackParam: "JSON_CALLBACK" } )
          .then(
            function response(data, status, headers, config ) {
              var names = data.data.anyMatchList.map(function(item,index){
		            return(item.commonNameList.commonNames.map(
			            function(commonname,indextrose){
				            return(commonname.commonName);
			            }
                ));
	            })
              .reduce(function(flat,toFlatten){
                return (flat.concat(toFlatten) );
	            },[] )
	            .filter(function(name, index, self){
		            return( ( name!== null ) && ( index === self.indexOf(name) ) );
	            });
              return( names /*.slice(0,100) */ ); /* re-enble a limiter! */
            }, function( error ) {
              //console.log( "getSuggeestedSpeciesNames error: ", error );
              defer.reject( error );
            } );
      } else {
        defer.resolve();
      }
    };

    service.getRegisteredSpecies = function getRegisteredSpecies( speciesName ) {
      var endpointUri = service.baseApiURL + "things/?name="+encodeURIComponent( speciesName );
      return($http({method:"GET",url:endpointUri}));
    };

    service.getSpeciesFromId = function getSpeciesFromId( idString ) {
      var endpointUri = service.baseApiURL + "things/" + idString;
      return($http({method:"GET",url:endpointUri}));
    };

    // inserts a species based on name. Should not create duplicate ites
    service.registerSpecies = function registerSpecies( speciesName ) {
      var registerSpeciesDoesNotExist = function registerSpeciesDoesNotExist( error ) {
        var endpointUri = service.baseApiURL + "things/";
        return($http({
          method:"POST",
          url:endpointUri,
          headers:{},
          data:{
            'name': speciesName
          }
        }).then(
          function registerSpeciesFinal( data ) {
            console.log("registerSpecies: created a new ", speciesName );
            // this used to return the species name in data.data but no longer
            return /*speciesName; //*/data.data;
          },
          function registerSpeciesFinalError( error ) {
            console.log( "registerSpeciesFinalError: ", error );
            return error;
          }
        ));
      };

      return(
        service.getRegisteredSpecies( speciesName ).then(
          function registerSpeciesButExists( data ) {
            if( data.data.length>0 ) {
              console.log("registerSpecies: Species already exists! ", speciesName, data );
              return data.data.shift();
            } else {
              // not in the database
              return registerSpeciesDoesNotExist( {} );
            }
          }
          // also request failure // registerSpeciesDoesNotExist( speciesName )
        )
      );
    };
    return service;
  }

  //
  //
  // sightingsSrvc
  //
  //

  sightingsSrvc.$inject = [
/*    '$ionicPlatform', */
    '$q',
    '$timeout',
    '$http'
  ];
  function sightingsSrvc(
    $q,
    $timeout,
    $http
  ) {
    var service = {};

    service.baseApiURL = "https://urbanwilddbapi.herokuapp.com/";

    service.getSightings = function getSightings( postcode, dateFrom, dateTo, thingsReference ) {
      // sightings are 'events'

      function addParameter( starting, parameter, value) {
        return( starting+(starting.length>0?"&":"")+
                encodeURIComponent( parameter )+"="+
                encodeURIComponent( value ) );
      }

      var parameters = "";
      if (angular.isDefined(postcode) ) {
        parameters = addParameter( parameters, "postcode", sanitisePostcode( postcode ) );
      }
      /*if (angular.isDefined(dateFrom) ) {
        parameters = addParameter( parameters, "date>", dateFrom );
      }
      if (angular.isDefined(dateTo) ) {
        parameters = addParameter( parameters, "date<", dateTo );
      }*/
      if (angular.isDefined(thingsReference) ) {
        parameters = addParameter( parameters, "thing", thingsReference );
      }

      var endpointUri = service.baseApiURL + "events/?"+parameters;

      return($http({method:"GET",url:endpointUri}));
    };

    service.registerSighting = function registerSighting( postcode, location, thingsReference ) {
      var event = {
        date: (new Date).getTime()
      };
      if( angular.isDefined( postcode ) ) {
        event.postcode = sanitisePostcode( postcode );
      }
      if( angular.isDefined( location ) ) {
        event.lat = location.lat;
        event.lon = location.lon;
      }
      if( angular.isDefined( thingsReference ) ) {
        event.thing = thingsReference;
      }
      console.log( "sightingsSrvc.registerSighting registering ", event );

      var endpointUri = service.baseApiURL + "events/";
      return $http({
        method:"POST",
        url:endpointUri,
        headers:{},
        data: event
      });
    };

    service.deleteSighting = function( ref ) {
      console.log("api.service.js:sightingSrvc.deleteSighting", ref);

      var endpointUri = service.baseApiURL + "events/" + ref;
      return $http({
        method:"DELETE",
        url:endpointUri,
        headers:{
          'Authorization':'Bearer '+localStorage.getItem("accessToken")
        },
      });

    };

    // standardises a postcode for data storage
    // @TODO, maybe - for now just returns inbounf postcode
    var sanitisePostcode = function sanitisePostcode( postcode ) {
      return postcode;
    };

    //
    return service;
  }

})();
