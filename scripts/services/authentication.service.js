(function(){
  'use strict';

  angular.module('app.auth', [ 'app.auth.notify' ] )
    .factory('authenticationService', authenticationService);

  authenticationService.$inject = [
    '$log' ,
    'authenticationNotifyService' 
  ];

  function authenticationService(
    $log ,
    authenticationNotifyService 
  ) {
  var self = this;
  var lock = null;
  var options = {
    autoclose: true,
    auth: {
      __useTenantInfo: true,
      responseType: "token id_token",
      mustAcceptTerms: true,
      redirect: false,
      params: {
        scope: 'openid profile email admin'
      }
    }
  };

  self.initialize = function () {
    if (lock == null) {
      lock = new Auth0Lock(
        window.auth_config.AUTH0_CLIENT_ID,
        window.auth_config.AUTH0_DOMAIN,
        options
      );
    }
  };

  self.initialize();

  self.setSession = function (authResult) {
    $log.log('AUTH RESULT',authResult);
    var expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    localStorage.setItem('accessToken', authResult.idToken);
    localStorage.setItem('expiresAt', expiresAt);
  };

  self.isAuthenticated = function(){
    var expiresAt = JSON.parse(localStorage.getItem('expiresAt'));
    return new Date().getTime() < expiresAt;
  };

  self.login = function () {
    lock.show();
  };

  self.logout = function(){
    localStorage.setItem('expiresAt',0);
    localStorage.setItem('accessToken','na');
  };

  lock.on('authenticated', function (authResult) {
    lock.getUserInfo(authResult.accessToken, function (error, profile) {
      if (error) {
        /*$log.error('authentication error');*/
        return;
      }
      localStorage.setItem('profile', profile.sub);
      self.setSession(authResult);
      authenticationNotifyService.publish('auth0');
      console.log(authResult.idToken);
    });
  });
    return this;
  }
})();
