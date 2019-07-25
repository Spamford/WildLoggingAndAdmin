// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', [
		'ui.router',
  	'ngAnimate',
  	'ui.bootstrap',
    'ui-notification',
    'app.homeState',
  	'app.searchState',
  	'app.aboutState',
  	'app.locations',
    'app.api',
    'app.loginState',
    'app.adminState'
	])
  .config(function(
    $sceDelegateProvider,
    $locationProvider
    ){




    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      "https://www.itis.gov/**"
    ]);

    $locationProvider.hashPrefix('');

    /// Comment out the line below to run the app
    // without HTML5 mode (will use hashes in routes)
    $locationProvider.html5Mode(true);


  })
  .run(function($state, $rootScope, $transitions, Notification) {

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      event.preventDefault();

      $state.get('about').error = { code: 123, description: 'Exception stack trace' }
      return $state.go('about');
    });

    $transitions.onSuccess({}, function() {
      $('.navbar-collapse').collapse('hide');
    });

  });

