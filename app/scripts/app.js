(function() {

  'use strict';

  angular.module('app', [
    'ionic',
    'leaflet-directive',
    'config',
    'ngLocale',
    'app.main',
    'app.login',
    'app.ajustes',
    'app.instalaciones',
    'app.fichaInstalacion',
    'app.routers',
    'app.localizadores',
    'app.agentes',
    'app.actuadores',
    'app.detalleInstalacion',
    'app.acercaDe',
    'app.alarmas'
  ])

    .config(function($socketProvider, $ionicConfigProvider){
        $socketProvider.configure({
            address: 'https://agrfid.servinet.net/ws',
            broadcastPrefix: '',
            parser: function(msg) {
                var data = [];
                var _msg = angular.fromJson(msg);
                if (_msg instanceof Array) {
                    data = _msg;
                }
                else {
                    data[0] = _msg.name;
                    data[1] = _msg.data;
                }
                return data;
            }
        });
        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.backButton.text('').previousTitleText(false);

    })

    .run(function($ionicPlatform, $timeout, config) {
        ionic.Platform.ready(function() {
            // hide the status bar using the StatusBar plugin
            StatusBar.hide();

            if (ionic.Platform.isIOS()) {
                config.setConfigApp({platform: 'IOS', deviceSrc: '/'});
            }

            if (ionic.Platform.isAndroid()) {
                config.setConfigApp({platform: 'android', deviceSrc: '/android_asset/www/'});
                //ocultamos la barra de navegación
                var autoHideNavigationBar = true;
                window.navigationbar.setUp(autoHideNavigationBar);

                document.addEventListener('resume', function() {
                    $timeout(function() {
                        window.navigationbar.hideNavigationBar();
                    },500);
                }, false);
            }
        });
    });


})();