(function () {

  'use strict';

  const app = angular.module('starter');

  app.service('authService', authService);

  authService.$inject = ['$state', 'angularAuth0', '$timeout'];

  function authService($state, angularAuth0, $timeout) {

    let service = {};

    let accessToken;
    let idToken;
    let expiresAt;

    service.getIdToken = function getIdToken() {
      return idToken;
    }

    service.getAccessToken = function getAccessToken() {
      return accessToken;
    }

    service.login = function login() {
      angularAuth0.authorize();
    }

    service.handleAuthentication = function handleAuthentication() {
      angularAuth0.parseHash(function (err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          service.localLogin(authResult);
          $state.go('callback');
        } else if (err) {
          $timeout(function () {
            $state.go('login');
          });
          console.log(err);
          alert('Error: ' + err.error + '. Check the console for further details.');
        }
      });
    }

    service.localLogin = function localLogin(authResult) {
      // Set isLoggedIn flag in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      // Set the time that the access token will expire at
      expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
      accessToken = authResult.accessToken;
      idToken = authResult.idToken;
    }

    service.renewTokens = function renewTokens() {
      angularAuth0.checkSession({},
        function(err, result) {
          if (err) {
            console.log(err);
          } else {
            service.localLogin(result);
            $state.go("admin");
          }
        }
      );
    }

    service.logout = function logout() {
      // Remove isLoggedIn flag from localStorage
      localStorage.removeItem('isLoggedIn');
      // Remove tokens and expiry time
      accessToken = '';
      idToken = '';
      expiresAt = 0;
      $state.go('login');
    }

    service.isAuthenticated = function isAuthenticated() {
      // Check whether the current time is past the 
      // access token's expiry time
      return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiresAt;
    }

    return service;

  }

})();