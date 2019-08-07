(function () {

    "use strict"; 

    const app = angular.module('starter', [
        'auth0.auth0',
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
    ]);

    app.config(function config(
        $sceDelegateProvider,
        $locationProvider,
        angularAuth0Provider
    )   {

        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            "https://www.itis.gov/**"
        ]);

        $locationProvider.hashPrefix('');

        /// Comment out the line below to run the app
        // without HTML5 mode (will use hashes in routes)
        $locationProvider.html5Mode(true);

        angularAuth0Provider.init({
            clientID: CLIENT_CONFIG.AUTH0_CLIENT_ID,
            domain: CLIENT_CONFIG.AUTH0_DOMAIN,
            responseType: 'token id_token',
            redirectUri: CLIENT_CONFIG.AUTH0_CALLBACK_URL,
            scope: CLIENT_CONFIG.AUTH0_REQUESTED_SCOPES,
            audience: CLIENT_CONFIG.AUTH0_AUDIENCE
        });

    });

    app.run(function ($state, $rootScope, $transitions, authService) {

        if (localStorage.getItem('isLoggedIn') === 'true') {
            authService.renewTokens();
        } else {
            // Handle the authentication
            // result in the hash
            authService.handleAuthentication();
        }

        // $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        //     event.preventDefault();

        //     $state.get('about').error = { code: 123, description: 'Exception stack trace' }
        //     return $state.go('about');
        // });

        $transitions.onSuccess({}, function () {
            $('.navbar-collapse').collapse('hide');
        });

    });

})();
