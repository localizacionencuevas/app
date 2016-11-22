(function() {
    'use strict';

    angular
      .module('app.main')
      .factory('dataService', dataservice);

      /* @ngInject */
    function dataservice($q, $http, config, $log) {
        var servicio = {
          login: login,
          getData: getData,
          sendData: sendData,
          sendTokenWS: sendTokenWS,
          getDatosPortada: getDatosPortada,
          getDatosUrl: getDatosUrl,
          loginAgente: loginAgente,
          sendDataAgente: sendDataAgente
        };

      return servicio;

      function login (userData) {

        return $http.post(config.urlLogin, userData)
          .success(function (token) {
            $log.info('login correcto');
            config.setUserToken(token.token);
            config.setLoginData(userData);

            config.setLoginStatus(true);
          })
          .error(function (error) {
            $log.warn('error al hacer login');

          });
      }

      function getData(url) {
          var _url = config.urlServer + url;
          var userToken = config.getUserToken();
          var _header = {"Authorization": userToken};

          return $http.get(_url, {headers : _header});
      }

      function sendData (url, datos, metodo){
          var _url = config.urlServer + url;
          var userToken = config.getUserToken() !== 'JWT ' ? config.getUserToken() : undefined;
          var _header = {"Authorization": userToken};

          var promise = $http({
                          url: _url,
                          method: metodo,
                          data: datos,
                          headers : _header
                      });

          return promise;
      }

      function sendTokenWS (datos){
          var _url = config.urlServer + 'obtener_token_ws/';
          var userToken = config.getUserToken() !== 'JWT ' ? config.getUserToken() : undefined;
          var _header = {"Authorization": userToken};

          var promise = $http({
                          url: _url,
                          method: "POST",
                          data: datos,
                          headers : _header
                      });

          return promise;
      }

      function getDatosPortada() {
          return getDatosUrl('portada');

      }

      function getDatosUrl(url) {
        return getData(url)
          .then(getDatosUrlComplete)
          .catch(function(e){
            $log.error('Error obteniendo datos: ', e);
          });

        function getDatosUrlComplete(data, status, headers, config) {
          return data.data;
        }
      }

      function loginAgente (url) {
        //Poner los datos del agente...
        return $http.post(url, {'email': '', 'password': ''});
      }

      function sendDataAgente (url, datos, token){
          var _header = {"Authorization": 'Bearer ' + token};

          var promise = $http({
                          url: url,
                          method: 'POST',
                          data: datos,
                          headers : _header
                      });

          return promise;
      }

    }
})();
