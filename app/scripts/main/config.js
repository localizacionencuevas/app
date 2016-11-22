(function() {
  'use strict';

  angular
  .module('app.main')
  .factory('config', config);

  function config() {

	// Cambiar las rutas por las correctas...
    // var _urlToken = 'http://localizacionencuevas';
    // var _urlWS = 'http://192.168.0.139:8083/ws';
    
    var configApp = {
      platform: '',
      deviceSrc:''
    };
    var loginData = {
        username: '',
        password: ''
    };
    var _preferencias = {
      mostrarInstalacion: false,
      idInstalacion: null
    };
    var userData = {};
    var userToken = 'JWT ';
    var loginStatus = false;

    var servicio = {
      urlToken: _urlToken,
      urlLogin: _urlToken + '/api-token-auth/',
      urlServer: _urlToken + '/api/v1/',
      urlMedia: _urlToken + '/media/',
      urlWS: _urlWS,
      // urlWS: _urlToken + '/ws',
      tokenWS: '',
      preferencias: _preferencias,
      setUrlToken: setUrlToken,
      setUrlWS: setUrlWS,
      getConfigApp: getConfigApp,
      setConfigApp: setConfigApp,
      getLoginData: getLoginData,
      setLoginData: setLoginData,
      setPreferencias: setPreferencias,
      getLoginStatus: getLoginStatus,
      setLoginStatus: setLoginStatus,
      getUserToken: getUserToken,
      setUserToken: setUserToken,
      getUserData: getUserData,
      setUserData: setUserData,
      resetData: resetData,
      backView: ''
    };

    return servicio;

// FUNCIONES
    function getUserToken () {
      return userToken;
    }

    function setUserToken(token) {
      userToken = userToken + token;
    }

    function setUrlToken(url) {
      _urlToken = url;
      servicio.urlToken = _urlToken;
      servicio.urlLogin= _urlToken + '/api-token-auth/';
      servicio.urlServer= _urlToken + '/api/v1/';
      servicio.urlMedia= _urlToken + '/media/';
    }

    function setUrlWS(url) {
      _urlWS = url;
      servicio.urlWS = _urlWS;
    }

    function getConfigApp() {
      return configApp;
    }

    function setConfigApp(data) {
      configApp.platform = data.platform;
      configApp.deviceSrc = data.deviceSrc;
    }

    function getLoginData() {
      return {
        'username': loginData.username,
        'password': loginData.password
      };
    }
    
    function setLoginData(data) {
      loginData = data;
    }

    function setPreferencias(data) {
      _preferencias = data;
      servicio.preferencias = _preferencias;
    }
    
    function getLoginStatus() {
      return loginStatus;
    }

    function setLoginStatus(status) {
      loginStatus = status;
    }

    function getUserData () {
      return userData;
    }

    function setUserData(_userData) {
      userData = _userData;
    }

    function resetData(_userData) {
      loginData = {
          username: '',
          password: ''
      };
      _preferencias = {
        mostrarInstalacion: false,
        idInstalacion: null
      };

      userData = {};
      userToken = 'JWT ';
      loginStatus = false;

      servicio.backView = '';
      servicio.preferencias = _preferencias;
    }
  }

})();
