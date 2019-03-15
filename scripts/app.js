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
  	'app.api'
	])
  .config(function($sceDelegateProvider){
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      "https://www.itis.gov/**"
    ]);
  })
  .run(function($state, $rootScope, Notification) {

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      event.preventDefault();

      $state.get('about').error = { code: 123, description: 'Exception stack trace' }
      return $state.go('about');
    }); 
  });

