(function() {
  'use strict';

    angular
        .module('app.fichaInstalacion')
        .factory('localizacionFactory', localizacionFactory);

    localizacionFactory.$inject = ['instalacionFactory', 'nivelesInstalacionFactory'];
    function localizacionFactory (instalacion, nivelesInstalacion) {
        var servicio = {
            actualizarPosicion: actualizarPosicion
        };

        return servicio;

        function actualizarPosicion (datos){
            var indexLocalizador = null, indexPadreActual = null, indexPadreAnterior = null;
            var _index = null, _dependientes = [], padres = [];

            //obtenemos los indices del localizador y el dispositivo padre actual y el anterior
            for (var i = 0; i < instalacion.localizadores.length; i++) {
              if (instalacion.localizadores[i].id == datos.localizador) {
                indexLocalizador = i;
              }
            }

            for (var j = 0; j < instalacion.routers.length; j++) {
                if (instalacion.routers[j].id === datos.dispositivo_padre) {
                    indexPadreActual = j;
                    if (instalacion.routers[j].codigo === instalacion.localizadores[indexLocalizador].depende) {
                        indexPadreAnterior = j;
                    }

                }
                else if ((instalacion.localizadores[indexLocalizador].depende !== "") && (instalacion.routers[j].codigo === instalacion.localizadores[indexLocalizador].depende)){
                        indexPadreAnterior = j;
                }
            }

            if ((indexPadreActual || indexPadreActual === 0) && (indexLocalizador || indexLocalizador === 0)) {
                instalacion.localizadores[indexLocalizador].planta = instalacion.routers[indexPadreActual].planta;
                if (indexPadreActual !== indexPadreAnterior) {
                    //actualizamos el padre del localizador
                    instalacion.localizadores[indexLocalizador].depende = instalacion.routers[indexPadreActual].codigo;

                    //actualizamos el array de dependientes del padre
                    instalacion.routers[indexPadreActual].nodosDependientes.push(instalacion.localizadores[indexLocalizador].id);
                }
                    
            }else{
                return false;
            }
          
        //actualizamos el array de dependientes del padre anterior
            if ((indexPadreAnterior || indexPadreAnterior === 0) && indexPadreActual !== indexPadreAnterior) {
                _dependientes = angular.copy(instalacion.routers[indexPadreAnterior].nodosDependientes);
                for (var h = 0; h < _dependientes.length; h++) {
                    if (_dependientes[h] === instalacion.localizadores[indexLocalizador].id) {
                        instalacion.routers[indexPadreAnterior].nodosDependientes.splice(h,1);
                    }
                }
                padres = [indexPadreActual, indexPadreAnterior];
            }
            else {
                // La primera vez que pinta el marcador no tiene padre anterior
                padres = [indexPadreActual];
            }
        //actualizamos en el mapa la posición de los localizadores dependientes de ambos routers
            dibujarMoviles(padres, datos);
        }


        function dibujarMoviles (padres, datosLoc) {
            for (var k = 0; k < padres.length; k++) {
                var _ind = padres[k];
                var _moviles = instalacion.routers[_ind].nodosDependientes;

                if (_moviles.length > 0) {
                    var distancia = instalacion.mapaInterior ? 18 : 0.0006;

                    var incrementoAngulo = 360 / 6;
                    var angulo = 360;
                    var _lat = instalacion.routers[_ind].lat, _lng = instalacion.routers[_ind].lng;
                    var latPIntermedio = 0, lngPIntermedio = 0;

                    for (var a = 0; a < _moviles.length; a++) {
                        for (var b = 0; b < instalacion.localizadores.length; b++) {
                            if (_moviles[a] == instalacion.localizadores[b].id) {
                                var dx = distancia * Math.sin(angulo * (Math.PI / 180));
                                var dy = distancia * Math.cos(angulo * (Math.PI / 180));

                                if (datosLoc.localizador === instalacion.localizadores[b].id ) {
                                    var lat2, lng2;
                                    for (var x = 0; x < instalacion.routers.length; x++) {
                                        if (instalacion.routers[x].id === datosLoc.segundo_dispositivo) {
                                            lat2 = instalacion.routers[x].lat;
                                            lng2 = instalacion.routers[x].lng;
                                        }
                                    }
                                    if (lat2 === undefined || lng2 === undefined) {
                                        return false;
                                    }

                                    if (datosLoc.punto_medio) {
                                        var puntoIntermedio = calcularIntermedio(lat2, lng2, _lat, _lng, datosLoc.posicion_mapa);
                                        latPIntermedio = puntoIntermedio[0];
                                        lngPIntermedio = puntoIntermedio[1];
                                    }

                                }

                                var lat = _lat + dx + latPIntermedio;
                                var lng = _lng + dy + lngPIntermedio;

                                if (!instalacion.localizadores[b].drawed) {
                                    instalacion.localizadores[b].drawed = true;
                                    if (instalacion.localizadores[b].planta === nivelesInstalacion.plantaActual.id) {
                                        instalacion.markers['localizador'+instalacion.localizadores[b].indice] = instalacion.localizadores[b];
                                    }
                                }
                                else {
                                // Si no está en la planta borramos antes el marcador
                                    if (instalacion.localizadores[b].planta !== nivelesInstalacion.plantaActual.id &&
                                        instalacion.markers['localizador'+instalacion.localizadores[b].indice]) {
                                        delete instalacion.markers['localizador'+instalacion.localizadores[b].indice]
                                    }
                                    else if (instalacion.localizadores[b].planta === nivelesInstalacion.plantaActual.id &&
                                        !instalacion.markers['localizador'+instalacion.localizadores[b].indice]) {
                                        instalacion.markers['localizador'+instalacion.localizadores[b].indice] = instalacion.localizadores[b];
                                    }
                                }

                                instalacion.localizadores[b].lat = lat;
                                instalacion.localizadores[b].lng = lng;
                      
                                angulo -= incrementoAngulo;
                                if (angulo <= 0) {
                                    angulo = 360;
                                    distancia += 5;
                                    if (instalacion.mapaInterior) {
                                        distancia += 12;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        //Obtenemos la distancia al nodo padre
        function calcularIntermedio (posFinalY, posFinalX, posInicialY, posInicialX, posicion) {
            var pxAdd = [];
            var rX = posFinalX - posInicialX,
                rY = posFinalY - posInicialY;
            var numerador = 0;  
            var denominador = 6;    
            // 4 posiciones en función de la lejanía al nodo padre
            switch(posicion) {
                    case 2:
                        numerador = 1;
                        break;
                    case 3:
                        numerador = 2;
                        break;
                    case 4:
                        numerador = 3;
                        break;
            }
                
            pxAdd[0] = numerador*rY/denominador;
            pxAdd[1] = numerador*rX/denominador;

            
            return pxAdd;
        }
    }

})();